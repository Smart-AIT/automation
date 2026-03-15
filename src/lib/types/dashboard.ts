/**
 * Dashboard Types
 * Defines data structures for the birthday automation dashboard
 */

export interface RecipientEntry {
  id: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string; // ISO format: YYYY-MM-DD
  customMessage: string;
  status: 'sent' | 'pending' | 'failed';
  sentDate?: string; // ISO format timestamp
  createdAt: string;
  updatedAt: string;
  userId: string;
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
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  customMessage: string;
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
  status?: 'sent' | 'pending' | 'failed' | 'all';
}
