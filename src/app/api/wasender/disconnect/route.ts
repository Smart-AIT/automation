import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { disconnectSession, deleteSession } from '@/lib/services/wasender';

const WASENDER_ACCESS_TOKEN = process.env.WASENDER_PERSONAL_ACCESS_TOKEN;

export async function POST() {
  try {
    if (!WASENDER_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'WaSender access token not configured' },
        { status: 500 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's client record
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (clientError || !client?.session_id) {
      return NextResponse.json(
        { error: 'No active session found' },
        { status: 404 }
      );
    }

    console.log('[DISCONNECT] Starting disconnect + delete for session:', client.session_id);

    // Step 1: Disconnect the session from WaSender
    const disconnectResult = await disconnectSession(
      WASENDER_ACCESS_TOKEN,
      client.session_id
    );
    console.log('[DISCONNECT] Disconnect result:', disconnectResult);

    // Step 2: Delete the session from WaSender so the phone number is freed up
    const deleteResult = await deleteSession(
      WASENDER_ACCESS_TOKEN,
      client.session_id
    );
    console.log('[DISCONNECT] Delete result:', deleteResult);

    // Step 3: Clean up the local database — clear session data so user can reconnect fresh
    await supabase
      .from('clients')
      .update({
        session_id: null,
        session_name: null,
        api_key: null,
        status: 'disconnected',
        phone_number: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    const warnings: string[] = [];
    if (!disconnectResult.success) {
      warnings.push(`Disconnect: ${disconnectResult.error}`);
    }
    if (!deleteResult.success) {
      warnings.push(`Delete: ${deleteResult.error}`);
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp disconnected and session deleted successfully',
      sessionDeleted: deleteResult.success,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (error) {
    console.error('Error in disconnect route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
