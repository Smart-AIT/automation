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
      // Use the first available session — regardless of its current status.
      // If it's connected we return early; if it's disconnected/expired/logged_out
      // we fall through to reconnect it via connectSession() below.
      const session = sessionsResult.data[0];
      sessionId = session.id;
      apiKey = session.api_key;
      sessionName = session.name;

      console.log('[CONNECT] Found existing session:', {
        id: sessionId,
        name: sessionName,
        status: session.status,
        phone: session.phone_number,
      });

      // If session is already connected, just update our database and return
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

      // For any other status (disconnected, expired, logged_out, need_scan, etc.),
      // we fall through to reconnect the EXISTING session below — no new session needed.
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
        name: `SendBox - ${user.email || user.id.slice(0, 8)}`,
        phone_number: formattedPhone,
        account_protection: true,
        log_messages: true,
        webhook_enabled: false,
      });

      if (!newSession.success || !newSession.data) {
        // Handle "number already used" — the phone is tied to a session on WaSender
        // that we couldn't see (e.g. it was created outside this app).
        // Re-fetch sessions in case one appeared after the failed create.
        const errorMsg = (newSession.error || '').toLowerCase();
        if (errorMsg.includes('already') || errorMsg.includes('exists') || errorMsg.includes('used')) {
          console.log('[CONNECT] Number already in use, re-fetching sessions...');
          const retryResult = await getAllSessions(WASENDER_ACCESS_TOKEN);
          if (retryResult.success && retryResult.data && retryResult.data.length > 0) {
            const existingSession = retryResult.data[0];
            sessionId = existingSession.id;
            apiKey = existingSession.api_key;
            sessionName = existingSession.name;
            console.log('[CONNECT] Found existing session on retry:', sessionId);
            // Fall through to connectSession below
          } else {
            return NextResponse.json(
              {
                error: 'This phone number is already registered with another WaSender session. Please log in to wasenderapi.com and delete the old session first, then try again.',
              },
              { status: 409 }
            );
          }
        } else {
          return NextResponse.json(
            { error: newSession.error || 'Failed to create WhatsApp session' },
            { status: 500 }
          );
        }
      } else {
        sessionId = newSession.data.id;
        apiKey = newSession.data.api_key;
        sessionName = newSession.data.name;
      }
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
