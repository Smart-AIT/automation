import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSessionStatus, getSessionDetails } from '@/lib/services/wasender';

const WASENDER_ACCESS_TOKEN = process.env.WASENDER_ACCESS_TOKEN;

export async function GET() {
  try {
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

    if (clientError || !client) {
      return NextResponse.json({
        success: true,
        status: 'not_configured',
        message: 'WhatsApp not connected yet',
      });
    }

    if (!client.api_key) {
      return NextResponse.json({
        success: true,
        status: 'not_configured',
        message: 'Session API key not found',
      });
    }

    // Get status from WaSender using session API key
    const statusResult = await getSessionStatus(client.api_key);

    if (!statusResult.success) {
      return NextResponse.json({
        success: true,
        status: client.status || 'disconnected',
        message: statusResult.error || 'Could not fetch status',
      });
    }

    const newStatus = statusResult.data?.status || 'disconnected';
    const phoneNumber = statusResult.data?.phone_number;

    // Update client status in database if changed
    if (newStatus !== client.status || (phoneNumber && phoneNumber !== client.phone_number)) {
      await supabase
        .from('clients')
        .update({
          status: newStatus,
          phone_number: phoneNumber || client.phone_number,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      phoneNumber: phoneNumber || client.phone_number,
      sessionName: client.session_name,
    });
  } catch (error) {
    console.error('Error in status route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
