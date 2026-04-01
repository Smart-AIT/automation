import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { disconnectSession } from '@/lib/services/wasender';

const WASENDER_ACCESS_TOKEN = process.env.WASENDER_ACCESS_TOKEN;

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

    // Disconnect from WaSender
    const disconnectResult = await disconnectSession(
      WASENDER_ACCESS_TOKEN,
      client.session_id
    );

    // Update client status regardless of API result
    await supabase
      .from('clients')
      .update({
        status: 'disconnected',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (!disconnectResult.success) {
      // Still return success since we updated local status
      return NextResponse.json({
        success: true,
        message: 'Session marked as disconnected',
        warning: disconnectResult.error,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp disconnected successfully',
    });
  } catch (error) {
    console.error('Error in disconnect route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
