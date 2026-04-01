import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTextMessage, formatPhoneNumber, getSessionStatus } from '@/lib/services/wasender';

// Initialize Supabase with service role key for bypassing RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Delay between messages in milliseconds (10 seconds to avoid spam detection)
const MESSAGE_DELAY_MS = 10000;

export async function GET(request: Request) {
  // To protect this route in production, verify the Vercel CRON_SECRET
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  try {
    const currentYear = new Date().getFullYear();

    // 1. Fetch Today's Birthdays using the RPC function
    const { data: birthdays, error: fetchError } = await supabase
      .rpc('get_todays_birthdays');

    if (fetchError) {
      console.error('Error fetching birthdays:', fetchError.message);
      return NextResponse.json({ error: 'Failed to fetch birthdays' }, { status: 500 });
    }

    if (!birthdays || birthdays.length === 0) {
      return NextResponse.json({ message: 'No birthdays to process today' }, { status: 200 });
    }

    // 2. Get all connected clients with their API keys
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('user_id, api_key, status')
      .eq('status', 'connected');

    if (clientsError) {
      console.error('Error fetching clients:', clientsError.message);
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }

    if (!clients || clients.length === 0) {
      console.log('No connected WhatsApp clients found');
      return NextResponse.json({ 
        message: 'No connected WhatsApp clients. Skipping birthday messages.',
        pending: birthdays.length 
      }, { status: 200 });
    }

    // Create a map of user_id to api_key for quick lookup
    const clientMap = new Map<string, string>();
    for (const client of clients) {
      if (client.api_key) {
        clientMap.set(client.user_id, client.api_key);
      }
    }

    let sentCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const processedEntries: string[] = [];

    // 3. Process each birthday
    for (const entry of birthdays) {
      // Check if user has a connected WhatsApp
      const apiKey = clientMap.get(entry.user_id);
      
      if (!apiKey) {
        console.log(`No WhatsApp connected for user ${entry.user_id}, skipping entry ${entry.id}`);
        skippedCount++;
        continue;
      }

      // Add delay between messages to avoid spam detection
      if (sentCount > 0 || errorCount > 0) {
        await new Promise(resolve => setTimeout(resolve, MESSAGE_DELAY_MS));
      }

      try {
        // Format phone number for WaSender API
        const formattedPhone = formatPhoneNumber(entry.phone_number);
        
        // Use custom message if available, otherwise use a default
        const message = entry.custom_message || 
          `Happy Birthday, ${entry.full_name}! 🎂🎉 Wishing you a wonderful day!`;

        // Send message via WaSenderAPI
        const sendResult = await sendTextMessage(apiKey, {
          to: formattedPhone,
          text: message,
        });

        if (sendResult.success) {
          // Update entry status to 'sent'
          const { error: updateError } = await supabase
            .from('recipient_entries')
            .update({ 
              status: 'sent',
              updated_at: new Date().toISOString(),
            })
            .eq('id', entry.id);

          if (updateError) {
            console.error(`Failed to update status for entry ${entry.id}:`, updateError.message);
            // Log to delivery_logs
            await logDelivery(entry.id, entry.user_id, 'failed', `DB update failed: ${updateError.message}`);
            errorCount++;
          } else {
            sentCount++;
            processedEntries.push(entry.id);
            // Log successful delivery
            await logDelivery(entry.id, entry.user_id, 'success', null);
          }
        } else {
          console.error(`Failed to send message to ${entry.phone_number}:`, sendResult.error);
          // Log to delivery_logs
          await logDelivery(entry.id, entry.user_id, 'failed', sendResult.error || 'Unknown error');
          errorCount++;
        }
      } catch (err) {
        console.error(`Exception while processing entry ${entry.id}:`, err);
        await logDelivery(entry.id, entry.user_id, 'failed', err instanceof Error ? err.message : 'Unknown exception');
        errorCount++;
      }
    }

    return NextResponse.json({
      message: 'Cron job completed',
      processed: birthdays.length,
      sent: sentCount,
      errors: errorCount,
      skipped: skippedCount,
      processedEntries,
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error in birthday cron route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Log delivery attempt to delivery_logs table
 */
async function logDelivery(
  recipientEntryId: string,
  userId: string,
  status: 'success' | 'failed',
  errorMessage: string | null
) {
  try {
    await supabase.from('delivery_logs').insert({
      recipient_entry_id: recipientEntryId,
      user_id: userId,
      status,
      error_message: errorMessage,
    });
  } catch (err) {
    console.error('Failed to log delivery:', err);
  }
}
