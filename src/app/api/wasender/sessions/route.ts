import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAllSessions } from '@/lib/services/wasender';

const WASENDER_ACCESS_TOKEN = process.env.WASENDER_ACCESS_TOKEN;

export async function GET() {
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

    // Get all sessions from WaSender
    const sessionsResult = await getAllSessions(WASENDER_ACCESS_TOKEN);

    if (!sessionsResult.success) {
      return NextResponse.json(
        { error: sessionsResult.error || 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    // Get user's current client record
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      success: true,
      sessions: sessionsResult.data || [],
      currentSessionId: client?.session_id || null,
    });
  } catch (error) {
    console.error('Error in sessions route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
