/**
 * WaSender API Types
 * Types for WaSenderAPI integration
 */

// Session statuses from WaSender API
export type WaSenderSessionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'need_scan'
  | 'logged_out'
  | 'expired';

// Session data from WaSender
export interface WaSenderSession {
  id: number;
  name: string;
  phone_number: string | null;
  status: WaSenderSessionStatus;
  account_protection: boolean;
  log_messages: boolean;
  read_incoming_messages: boolean;
  webhook_url: string | null;
  webhook_enabled: boolean;
  webhook_events: string[];
  api_key: string;
  webhook_secret: string;
  created_at: string;
  updated_at: string;
}

// API Response wrapper
export interface WaSenderApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// QR Code response
export interface WaSenderQRCodeResponse {
  qr_code: string; // Base64 encoded QR image
  status: WaSenderSessionStatus;
}

// Status response
export interface WaSenderStatusResponse {
  status: WaSenderSessionStatus;
  phone_number?: string;
  name?: string;
}

// Send message request
export interface WaSenderSendMessageRequest {
  to: string; // Phone number in E.164 format (e.g., 919876543210)
  text: string;
}

// Send message response
export interface WaSenderSendMessageResponse {
  success: boolean;
  message_id?: string;
  error?: string;
}

// Client record in Supabase
export interface ClientRecord {
  id: string;
  user_id: string;
  session_id: number | null;
  session_name: string | null;
  api_key: string | null;
  status: WaSenderSessionStatus | 'disconnected';
  phone_number: string | null;
  created_at: string;
  updated_at: string;
}

// Delivery log record
export interface DeliveryLog {
  id: string;
  recipient_entry_id: string;
  user_id: string;
  status: 'success' | 'failed';
  error_message: string | null;
  sent_at: string;
}

// Create session request
export interface CreateSessionRequest {
  name: string;
  phone_number?: string;
  account_protection?: boolean;
  log_messages?: boolean;
  webhook_url?: string;
  webhook_enabled?: boolean;
  webhook_events?: string[];
}

// List sessions response
export interface WaSenderListSessionsResponse {
  data: WaSenderSession[];
}
