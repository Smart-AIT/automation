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
    fullName: 'John Doe',
    phoneNumber: '+1 (555) 000-0000',
    dateOfBirth: '1995-10-24',
    customMessage: 'Happy Birthday! Hope your day is as amazing...',
    status: 'sent',
    sentDate: '2024-10-24T10:30:00Z',
    createdAt: '2024-10-20T08:00:00Z',
    updatedAt: '2024-10-24T10:30:00Z',
    userId: 'user-1',
  },
  {
    id: '2',
    fullName: 'Jane Smith',
    phoneNumber: '+1 987 654 321',
    dateOfBirth: '1985-11-02',
    customMessage: 'Have a great day Jane! Enjoy your special celebration...',
    status: 'sent',
    sentDate: '2024-11-02T09:15:00Z',
    createdAt: '2024-10-28T08:00:00Z',
    updatedAt: '2024-11-02T09:15:00Z',
    userId: 'user-1',
  },
  {
    id: '3',
    fullName: 'Robert Brown',
    phoneNumber: '+1 555 012 345',
    dateOfBirth: '1992-10-22',
    customMessage: 'Best wishes Robert! May this year bring you m...',
    status: 'pending',
    createdAt: '2024-10-15T08:00:00Z',
    updatedAt: '2024-10-15T08:00:00Z',
    userId: 'user-1',
  },
  {
    id: '4',
    fullName: 'Emily Davis',
    phoneNumber: '+1 444 789 012',
    dateOfBirth: '1988-12-15',
    customMessage: 'Cheers to you Emily! Another year of wonderful...',
    status: 'sent',
    sentDate: '2024-12-15T12:00:00Z',
    createdAt: '2024-11-10T08:00:00Z',
    updatedAt: '2024-12-15T12:00:00Z',
    userId: 'user-1',
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
          entry.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.phoneNumber.includes(searchQuery)
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
      ...payload,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user-1', // TODO: Get from session
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
      updatedAt: new Date().toISOString(),
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
        entry.fullName.toLowerCase().includes(query.toLowerCase()) ||
        entry.phoneNumber.includes(query)
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
