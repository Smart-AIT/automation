import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAllSessions, createSession, connectSession } from '@/lib/services/wasender';

const WASENDER_ACCESS_TOKEN = process.env.WASENDER_ACCESS_TOKEN;

export async function POST(request: Request) {
  try {
    if (!WASENDER_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'WaSender access token not configured' },
        { status: 500 }
      );
    }

    // Get phone number from request body (optional - for creating new sessions)
    let phoneNumber: string | undefined;
    try {
      const body = await request.json();
      phoneNumber = body.phoneNumber;
    } catch {
      // No body provided, that's okay
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

    // Check if user already has a client record
    const { data: existingClient } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .single();

    let sessionId: number;
    let apiKey: string;
    let sessionName: string;

    // First, get all existing sessions from WaSenderAPI
    const sessionsResult = await getAllSessions(WASENDER_ACCESS_TOKEN);

    if (!sessionsResult.success) {
      return NextResponse.json(
        { error: sessionsResult.error || 'Failed to fetch sessions from WaSenderAPI' },
        { status: 500 }
      );
    }

    // Check if there are existing sessions we can use
    if (sessionsResult.data && sessionsResult.data.length > 0) {
      // Use the first available session
      const session = sessionsResult.data[0];
      sessionId = session.id;
      apiKey = session.api_key;
      sessionName = session.name;

      // If session is already connected, just update our database
      if (session.status === 'connected') {
        if (existingClient) {
          await supabase
            .from('clients')
            .update({
              session_id: sessionId,
              session_name: sessionName,
              api_key: apiKey,
              status: 'connected',
              phone_number: session.phone_number,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);
        } else {
          await supabase.from('clients').insert({
            user_id: user.id,
            session_id: sessionId,
            session_name: sessionName,
            api_key: apiKey,
            status: 'connected',
            phone_number: session.phone_number,
          });
        }

        return NextResponse.json({
          success: true,
          message: 'WhatsApp already connected!',
          sessionId,
          alreadyConnected: true,
        });
      }
    } else {
      // No sessions exist - we need to create one
      // Phone number is required for creating a new session
      if (!phoneNumber) {
        return NextResponse.json(
          { 
            error: 'Phone number required',
            needsPhoneNumber: true,
            message: 'Please enter your WhatsApp phone number to continue.',
          },
          { status: 400 }
        );
      }

      // Format phone number (remove spaces, ensure it has country code)
      const formattedPhone = phoneNumber.replace(/[\s\-()]/g, '');

      // Create a new session with all required fields
      const newSession = await createSession(WASENDER_ACCESS_TOKEN, {
        name: `Birthday Bot - ${user.email || user.id.slice(0, 8)}`,
        phone_number: formattedPhone,
        account_protection: true,
        log_messages: true,
        webhook_enabled: false,
      });

      if (!newSession.success || !newSession.data) {
        return NextResponse.json(
          { error: newSession.error || 'Failed to create WhatsApp session' },
          { status: 500 }
        );
      }

      sessionId = newSession.data.id;
      apiKey = newSession.data.api_key;
      sessionName = newSession.data.name;
    }

    // Connect the session (this initiates QR code generation)
    const connectResult = await connectSession(WASENDER_ACCESS_TOKEN, sessionId);

    if (!connectResult.success) {
      console.error('Connect session failed:', connectResult.error);
      // Even if connect fails, we might still be able to get QR
    }

    // Update or create client record
    if (existingClient) {
      await supabase
        .from('clients')
        .update({
          session_id: sessionId,
          session_name: sessionName,
          api_key: apiKey,
          status: 'connecting',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    } else {
      await supabase.from('clients').insert({
        user_id: user.id,
        session_id: sessionId,
        session_name: sessionName,
        api_key: apiKey,
        status: 'connecting',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Connection initiated. Please scan the QR code.',
      sessionId,
    });
  } catch (error) {
    console.error('Error in connect route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
