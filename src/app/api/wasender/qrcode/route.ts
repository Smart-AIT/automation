import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getQRCode, connectSession } from '@/lib/services/wasender';
import QRCode from 'qrcode';

const WASENDER_ACCESS_TOKEN = process.env.WASENDER_ACCESS_TOKEN;

/**
 * Convert QR code data to a displayable image
 * WaSenderAPI returns the QR code as a string that needs to be encoded into an image
 */
async function generateQRImage(qrData: string): Promise<string> {
  // Check if it's already a base64 data URI
  if (qrData.startsWith('data:image')) {
    return qrData;
  }
  
  // Check if it's already base64 (without prefix)
  // Base64 image data is usually very long and contains specific characters
  if (qrData.length > 1000 && /^[A-Za-z0-9+/=]+$/.test(qrData.replace(/\s/g, ''))) {
    return `data:image/png;base64,${qrData}`;
  }
  
  // Otherwise, it's a QR code string that we need to convert to an image
  // This is what WaSenderAPI likely returns - the WhatsApp linking string
  try {
    const qrImageDataUrl = await QRCode.toDataURL(qrData, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrImageDataUrl;
  } catch (error) {
    console.error('Error generating QR image:', error);
    throw new Error('Failed to generate QR code image');
  }
}

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

    // Get user's client record
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (clientError || !client?.session_id) {
      return NextResponse.json(
        { error: 'No session found. Please initiate connection first.' },
        { status: 404 }
      );
    }

    console.log('Fetching QR code for session:', client.session_id);

    // Try to get QR code from WaSender
    let qrResult = await getQRCode(WASENDER_ACCESS_TOKEN, client.session_id);

    // If QR not available, try connecting the session first then get QR again
    if (!qrResult.success) {
      console.log('QR not available, trying to connect session first...');
      await connectSession(WASENDER_ACCESS_TOKEN, client.session_id);
      
      // Wait a moment for the session to initialize
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try again
      qrResult = await getQRCode(WASENDER_ACCESS_TOKEN, client.session_id);
    }

    if (!qrResult.success || !qrResult.data?.qr_code) {
      return NextResponse.json(
        { 
          error: qrResult.error || 'QR code not available',
          retryable: true,
        },
        { status: 400 }
      );
    }

    // Generate QR image from the QR code data
    const qrImage = await generateQRImage(qrResult.data.qr_code);

    return NextResponse.json({
      success: true,
      qrCode: qrImage,
      status: qrResult.data?.status,
    });
  } catch (error) {
    console.error('Error in qrcode route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
