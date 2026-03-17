import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase. For cron jobs that bypass RLS, it's best to use the SERVICE_ROLE_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  // To protect this route in production, you can verify the Vercel CRON_SECRET
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  try {
    // 1. Fetch Today's Birthdays
    const { data: birthdays, error: fetchError } = await supabase
      .rpc('get_todays_birthdays');

    if (fetchError) {
      console.error('Error fetching birthdays:', fetchError.message);
      return NextResponse.json({ error: 'Failed to fetch birthdays' }, { status: 500 });
    }

    if (!birthdays || birthdays.length === 0) {
      return NextResponse.json({ message: 'No birthdays to process today' }, { status: 200 });
    }

    const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
    const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      return NextResponse.json({ error: 'WhatsApp credentials missing' }, { status: 500 });
    }

    let sentCount = 0;
    let errorCount = 0;
    const currentYear = new Date().getFullYear();

    // 2. Loop through results and send WhatsApp
    for (const entry of birthdays) {
      try {
        // Add a small delay (300ms) between sends to prevent hitting WhatsApp API rate limits
        if (sentCount > 0 || errorCount > 0) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }

        const templateData = {
          messaging_product: "whatsapp",
          to: entry.phone_number,
          type: "template",
          template: {
            name: "hello_world", // Replace with your actual WhatsApp template name
            language: { code: "en_US" }
          }
        };

        const response = await fetch(`https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(templateData),
        });

        const responseData = await response.json();

        if (!response.ok) {
          console.error(`Failed to send message to ${entry.phone_number}:`, responseData);
          errorCount++;
          continue; // Skip database update if message failed to send
        }

        // 3. Mark as sent in the database after successful send
        const { error: updateError } = await supabase
          .from('recipient_entries')
          .update({ 
            last_sent_year: currentYear, 
            status: 'sent' 
          })
          .eq('id', entry.id);

        if (updateError) {
          console.error(`Failed to update DB for entry ${entry.id}:`, updateError.message);
          errorCount++;
        } else {
          sentCount++;
        }
      } catch (err) {
        console.error(`Exception while processing entry ${entry.id}:`, err);
        errorCount++;
      }
    }

    return NextResponse.json({
      message: 'Cron job completed',
      processed: birthdays.length,
      sent: sentCount,
      errors: errorCount
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error in birthday cron route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
