/**
 * WaSender API Service
 * Utility functions for interacting with WaSenderAPI
 */

import type {
  WaSenderSession,
  WaSenderApiResponse,
  WaSenderQRCodeResponse,
  WaSenderStatusResponse,
  WaSenderSendMessageRequest,
  WaSenderSendMessageResponse,
  CreateSessionRequest,
  WaSenderListSessionsResponse,
} from '@/lib/types/wasender';

const WASENDER_BASE_URL = 'https://wasenderapi.com/api';

/**
 * Get headers for WaSender API requests
 * Uses Personal Access Token for session management
 */
function getAuthHeaders(token: string): HeadersInit {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

/**
 * Get headers using session-specific API key
 * Used for sending messages
 */
function getSessionAuthHeaders(apiKey: string): HeadersInit {
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

/**
 * Get all WhatsApp sessions
 */
export async function getAllSessions(
  accessToken: string
): Promise<WaSenderApiResponse<WaSenderSession[]>> {
  try {
    const response = await fetch(`${WASENDER_BASE_URL}/whatsapp-sessions`, {
      method: 'GET',
      headers: getAuthHeaders(accessToken),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to fetch sessions',
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return {
      success: false,
      error: 'Network error while fetching sessions',
    };
  }
}

/**
 * Create a new WhatsApp session
 */
export async function createSession(
  accessToken: string,
  sessionData: CreateSessionRequest
): Promise<WaSenderApiResponse<WaSenderSession>> {
  try {
    const response = await fetch(`${WASENDER_BASE_URL}/whatsapp-sessions`, {
      method: 'POST',
      headers: getAuthHeaders(accessToken),
      body: JSON.stringify(sessionData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to create session',
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error('Error creating session:', error);
    return {
      success: false,
      error: 'Network error while creating session',
    };
  }
}

/**
 * Connect/initialize a WhatsApp session
 */
export async function connectSession(
  accessToken: string,
  sessionId: number
): Promise<WaSenderApiResponse<null>> {
  try {
    const response = await fetch(
      `${WASENDER_BASE_URL}/whatsapp-sessions/${sessionId}/connect`,
      {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to connect session',
      };
    }

    return {
      success: true,
      message: data.message || 'Session connection initiated',
    };
  } catch (error) {
    console.error('Error connecting session:', error);
    return {
      success: false,
      error: 'Network error while connecting session',
    };
  }
}

/**
 * Get QR code for a session
 */
export async function getQRCode(
  accessToken: string,
  sessionId: number
): Promise<WaSenderApiResponse<WaSenderQRCodeResponse>> {
  try {
    const response = await fetch(
      `${WASENDER_BASE_URL}/whatsapp-sessions/${sessionId}/qrcode`,
      {
        method: 'GET',
        headers: getAuthHeaders(accessToken),
      }
    );

    // Get raw text first to understand the response format
    const rawText = await response.text();
    console.log('QR Code API raw response:', rawText.substring(0, 500));

    if (!response.ok) {
      try {
        const errorData = JSON.parse(rawText);
        return {
          success: false,
          error: errorData.message || errorData.error || 'Failed to get QR code',
        };
      } catch {
        return {
          success: false,
          error: rawText || 'Failed to get QR code',
        };
      }
    }

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      // If not JSON, might be raw base64 or an image
      if (rawText.startsWith('data:') || rawText.length > 100) {
        return {
          success: true,
          data: {
            qr_code: rawText,
            status: 'need_scan',
          },
        };
      }
      return {
        success: false,
        error: 'Invalid response format from QR code API',
      };
    }

    console.log('QR Code API parsed response:', JSON.stringify(data, null, 2).substring(0, 1000));

    // Handle various response formats from WaSenderAPI
    const qrData = data.data || data;
    const qrCode = qrData.qr_code || qrData.qrCode || qrData.qr || qrData.image || qrData.base64 || qrData.code;
    
    if (!qrCode) {
      console.log('No QR code found in response. Keys present:', Object.keys(qrData));
      return {
        success: false,
        error: 'QR code not available yet. Please wait a moment and try again.',
      };
    }

    return {
      success: true,
      data: {
        qr_code: qrCode,
        status: qrData.status || 'need_scan',
      },
    };
  } catch (error) {
    console.error('Error getting QR code:', error);
    return {
      success: false,
      error: 'Network error while getting QR code',
    };
  }
}

/**
 * Get session status using session API key
 */
export async function getSessionStatus(
  apiKey: string
): Promise<WaSenderApiResponse<WaSenderStatusResponse>> {
  try {
    const response = await fetch(`${WASENDER_BASE_URL}/status`, {
      method: 'GET',
      headers: getSessionAuthHeaders(apiKey),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to get session status',
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error('Error getting session status:', error);
    return {
      success: false,
      error: 'Network error while getting session status',
    };
  }
}

/**
 * Get session details
 */
export async function getSessionDetails(
  accessToken: string,
  sessionId: number
): Promise<WaSenderApiResponse<WaSenderSession>> {
  try {
    const response = await fetch(
      `${WASENDER_BASE_URL}/whatsapp-sessions/${sessionId}`,
      {
        method: 'GET',
        headers: getAuthHeaders(accessToken),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to get session details',
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error('Error getting session details:', error);
    return {
      success: false,
      error: 'Network error while getting session details',
    };
  }
}

/**
 * Disconnect a WhatsApp session
 */
export async function disconnectSession(
  accessToken: string,
  sessionId: number
): Promise<WaSenderApiResponse<null>> {
  try {
    const response = await fetch(
      `${WASENDER_BASE_URL}/whatsapp-sessions/${sessionId}/disconnect`,
      {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to disconnect session',
      };
    }

    return {
      success: true,
      message: data.message || 'Session disconnected',
    };
  } catch (error) {
    console.error('Error disconnecting session:', error);
    return {
      success: false,
      error: 'Network error while disconnecting session',
    };
  }
}

/**
 * Send a text message using session API key
 */
export async function sendTextMessage(
  apiKey: string,
  request: WaSenderSendMessageRequest
): Promise<WaSenderSendMessageResponse> {
  try {
    const response = await fetch(`${WASENDER_BASE_URL}/send-message`, {
      method: 'POST',
      headers: getSessionAuthHeaders(apiKey),
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || 'Failed to send message',
      };
    }

    return {
      success: true,
      message_id: data.data?.message_id || data.message_id,
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      success: false,
      error: 'Network error while sending message',
    };
  }
}

/**
 * Check if a phone number is on WhatsApp
 */
export async function checkNumberOnWhatsApp(
  apiKey: string,
  phoneNumber: string
): Promise<WaSenderApiResponse<{ on_whatsapp: boolean }>> {
  try {
    // Clean phone number - remove + and spaces
    const cleanNumber = phoneNumber.replace(/[\s+\-()]/g, '');
    
    const response = await fetch(
      `${WASENDER_BASE_URL}/on-whatsapp/${cleanNumber}`,
      {
        method: 'GET',
        headers: getSessionAuthHeaders(apiKey),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to check number',
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error('Error checking number:', error);
    return {
      success: false,
      error: 'Network error while checking number',
    };
  }
}

/**
 * Format phone number for WaSender API (E.164 without +)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If it starts with 0, assume Indian number and replace with 91
  if (cleaned.startsWith('0')) {
    cleaned = '91' + cleaned.substring(1);
  }
  
  // If it's 10 digits, assume Indian number
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  
  return cleaned;
}
