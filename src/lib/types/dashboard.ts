/**
 * Dashboard Types
 * Defines data structures for the birthday automation dashboard
 */

export interface RecipientEntry {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  date_of_birth: string; // ISO format: YYYY-MM-DD
  custom_message: string;
  status: 'sent' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface DashboardStatistics {
  totalEntries: number;
  sentTillNow: number;
  pending: number;
}

export interface DashboardResponse {
  statistics: DashboardStatistics;
  entries: RecipientEntry[];
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

export interface CreateEntryPayload {
  full_name: string;
  phone_number: string;
  date_of_birth: string;
  custom_message: string;
}

export interface UpdateEntryPayload extends Partial<CreateEntryPayload> {
  id: string;
}

export interface DeleteEntryPayload {
  id: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  searchQuery?: string;
  status?: 'sent' | 'pending' | 'all';
}
