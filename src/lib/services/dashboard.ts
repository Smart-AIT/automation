/**
 * Dashboard Service
 * Handles all dashboard-related business logic and API calls
 */

import type {
  RecipientEntry,
  DashboardResponse,
  CreateEntryPayload,
  UpdateEntryPayload,
  DeleteEntryPayload,
  PaginationParams,
} from '../types/dashboard';

// Mock data - Replace with actual API calls
const MOCK_ENTRIES: RecipientEntry[] = [
  {
    id: '1',
    user_id: 'user-1',
    full_name: 'example',
    phone_number: '+1 (555) 000-0000',
    date_of_birth: '1995-10-24',
    custom_message: 'Happy Birthday! Hope your day is as amazing...',
    status: 'sent',
    created_at: '2024-10-20T08:00:00Z',
    updated_at: '2024-10-24T10:30:00Z',
  },
  {
    id: '2',
    user_id: 'user-1',
    full_name: 'Jane Smith',
    phone_number: '+1 987 654 321',
    date_of_birth: '1985-11-02',
    custom_message: 'Have a great day Jane! Enjoy your special celebration...',
    status: 'sent',
    created_at: '2024-10-28T08:00:00Z',
    updated_at: '2024-11-02T09:15:00Z',
  },
  {
    id: '3',
    user_id: 'user-1',
    full_name: 'Robert Brown',
    phone_number: '+1 555 012 345',
    date_of_birth: '1992-10-22',
    custom_message: 'Best wishes Robert! May this year bring you m...',
    status: 'pending',
    created_at: '2024-10-15T08:00:00Z',
    updated_at: '2024-10-15T08:00:00Z',
  },
  {
    id: '4',
    user_id: 'user-1',
    full_name: 'Emily Davis',
    phone_number: '+1 444 789 012',
    date_of_birth: '1988-12-15',
    custom_message: 'Cheers to you Emily! Another year of wonderful...',
    status: 'sent',
    created_at: '2024-11-10T08:00:00Z',
    updated_at: '2024-12-15T12:00:00Z',
  },
];

/**
 * Get dashboard data with statistics and paginated entries
 */
export async function getDashboardData(
  params: PaginationParams
): Promise<DashboardResponse> {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/dashboard', { method: 'GET' })

    const { page = 1, pageSize = 10, searchQuery = '', status = 'all' } = params;

    // Filter entries
    let filteredEntries = MOCK_ENTRIES;

    if (searchQuery) {
      filteredEntries = filteredEntries.filter(
        (entry) =>
          entry.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.phone_number.includes(searchQuery)
      );
    }

    if (status !== 'all') {
      filteredEntries = filteredEntries.filter((entry) => entry.status === status);
    }

    // Pagination
    const totalPages = Math.ceil(filteredEntries.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedEntries = filteredEntries.slice(startIndex, startIndex + pageSize);

    // Calculate statistics
    const totalEntries = MOCK_ENTRIES.length;
    const sentTillNow = MOCK_ENTRIES.filter((e) => e.status === 'sent').length;
    const pending = MOCK_ENTRIES.filter((e) => e.status === 'pending').length;

    return {
      statistics: {
        totalEntries,
        sentTillNow,
        pending,
      },
      entries: paginatedEntries,
      hasMore: page < totalPages,
      currentPage: page,
      totalPages,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw new Error('Failed to fetch dashboard data');
  }
}

/**
 * Get single entry by ID
 */
export async function getEntryById(id: string): Promise<RecipientEntry | null> {
  try {
    // TODO: Replace with actual API call
    return MOCK_ENTRIES.find((entry) => entry.id === id) || null;
  } catch (error) {
    console.error('Error fetching entry:', error);
    throw new Error('Failed to fetch entry');
  }
}

/**
 * Create new entry
 */
export async function createEntry(payload: CreateEntryPayload): Promise<RecipientEntry> {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/dashboard/entries', {
    //   method: 'POST',
    //   body: JSON.stringify(payload),
    // })

    const newEntry: RecipientEntry = {
      id: Date.now().toString(),
      user_id: 'user-1',
      full_name: payload.full_name,
      phone_number: payload.phone_number,
      date_of_birth: payload.date_of_birth,
      custom_message: payload.custom_message,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return newEntry;
  } catch (error) {
    console.error('Error creating entry:', error);
    throw new Error('Failed to create entry');
  }
}

/**
 * Update existing entry
 */
export async function updateEntry(payload: UpdateEntryPayload): Promise<RecipientEntry> {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/dashboard/entries/${payload.id}`, {
    //   method: 'PUT',
    //   body: JSON.stringify(payload),
    // })

    const entry = MOCK_ENTRIES.find((e) => e.id === payload.id);
    if (!entry) {
      throw new Error('Entry not found');
    }

    const updatedEntry: RecipientEntry = {
      ...entry,
      ...payload,
      updated_at: new Date().toISOString(),
    };

    return updatedEntry;
  } catch (error) {
    console.error('Error updating entry:', error);
    throw new Error('Failed to update entry');
  }
}

/**
 * Delete entry
 */
export async function deleteEntry(payload: DeleteEntryPayload): Promise<void> {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/dashboard/entries/${payload.id}`, {
    //   method: 'DELETE',
    // })

    const index = MOCK_ENTRIES.findIndex((e) => e.id === payload.id);
    if (index === -1) {
      throw new Error('Entry not found');
    }
  } catch (error) {
    console.error('Error deleting entry:', error);
    throw new Error('Failed to delete entry');
  }
}

/**
 * Search entries
 */
export async function searchEntries(query: string): Promise<RecipientEntry[]> {
  try {
    // TODO: Replace with actual API call
    const results = MOCK_ENTRIES.filter(
      (entry) =>
        entry.full_name.toLowerCase().includes(query.toLowerCase()) ||
        entry.phone_number.includes(query)
    );

    return results;
  } catch (error) {
    console.error('Error searching entries:', error);
    throw new Error('Failed to search entries');
  }
}

/**
 * Filter entries by status
 */
export async function filterByStatus(status: 'sent' | 'pending' | 'failed'): Promise<RecipientEntry[]> {
  try {
    // TODO: Replace with actual API call
    return MOCK_ENTRIES.filter((entry) => entry.status === status);
  } catch (error) {
    console.error('Error filtering entries:', error);
    throw new Error('Failed to filter entries');
  }
}
