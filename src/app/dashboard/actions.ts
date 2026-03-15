'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type {
  RecipientEntry,
  CreateEntryPayload,
  UpdateEntryPayload,
  DeleteEntryPayload,
} from '@/lib/types/dashboard';

/**
 * Get all entries for the current user with pagination and filtering
 */
export async function getEntriesAction(
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  status?: 'sent' | 'pending' | 'all'
) {
  try {
    const supabase = await createSupabaseServerClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('Auth error:', userError);
      return { error: `Authentication failed: ${userError.message}` };
    }

    if (!user) {
      console.error('No user found in session');
      return { error: 'User session not found. Please log in again.' };
    }

    let query = supabase
      .from('recipient_entries')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply search filter
    if (searchQuery) {
      query = query.or(
        `full_name.ilike.%${searchQuery}%,phone_number.ilike.%${searchQuery}%`
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    query = query.range(startIndex, startIndex + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching entries:', error);
      return { error: error.message };
    }

    // Calculate statistics (all entries for current user)
    const statsQuery = supabase
      .from('recipient_entries')
      .select('status', { count: 'exact' })
      .eq('user_id', user.id);

    const { data: allEntries, count: totalCount } = await statsQuery;

    const totalEntries = totalCount || 0;
    const sentTillNow =
      allEntries?.filter((e: any) => e.status === 'sent').length || 0;
    const pending = allEntries?.filter((e: any) => e.status === 'pending').length || 0;

    const totalPages = Math.ceil(totalCount! / pageSize);

    return {
      entries: (data || []) as RecipientEntry[],
      statistics: {
        totalEntries,
        sentTillNow,
        pending,
      },
      hasMore: page < totalPages,
      currentPage: page,
      totalPages,
    };
  } catch (error) {
    console.error('Action error:', error);
    return { error: 'Failed to fetch entries' };
  }
}

/**
 * Create a new recipient entry
 */
export async function createEntryAction(payload: CreateEntryPayload) {
  try {
    const supabase = await createSupabaseServerClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('Auth error:', userError);
      return { error: `Authentication failed: ${userError.message}` };
    }

    if (!user) {
      console.error('No user found in session');
      return { error: 'User session not found. Please log in again.' };
    }

    // Create entry
    const { data, error } = await supabase
      .from('recipient_entries')
      .insert({
        user_id: user.id,
        full_name: payload.full_name,
        phone_number: payload.phone_number,
        date_of_birth: payload.date_of_birth,
        custom_message: payload.custom_message,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating entry:', error);
      // Handle specific constraint violations
      if (error.code === '23505') {
        return { error: 'Phone number already exists' };
      }
      return { error: error.message };
    }

    return { data: data as RecipientEntry };
  } catch (error) {
    console.error('Action error:', error);
    return { error: 'Failed to create entry' };
  }
}

/**
 * Update an existing recipient entry
 */
export async function updateEntryAction(payload: UpdateEntryPayload) {
  try {
    const supabase = await createSupabaseServerClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('Auth error:', userError);
      return { error: `Authentication failed: ${userError.message}` };
    }

    if (!user) {
      console.error('No user found in session');
      return { error: 'User session not found. Please log in again.' };
    }

    // Build update object
    const updateData: Record<string, any> = {};
    if (payload.full_name) updateData.full_name = payload.full_name;
    if (payload.phone_number) updateData.phone_number = payload.phone_number;
    if (payload.date_of_birth) updateData.date_of_birth = payload.date_of_birth;
    if (payload.custom_message) updateData.custom_message = payload.custom_message;

    // Update entry
    const { data, error } = await supabase
      .from('recipient_entries')
      .update(updateData)
      .eq('id', payload.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating entry:', error);
      if (error.code === '23505') {
        return { error: 'Phone number already exists' };
      }
      return { error: error.message };
    }

    return { data: data as RecipientEntry };
  } catch (error) {
    console.error('Action error:', error);
    return { error: 'Failed to update entry' };
  }
}

/**
 * Delete a recipient entry
 */
export async function deleteEntryAction(id: string) {
  try {
    const supabase = await createSupabaseServerClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('Auth error:', userError);
      return { error: `Authentication failed: ${userError.message}` };
    }

    if (!user) {
      console.error('No user found in session');
      return { error: 'User session not found. Please log in again.' };
    }

    // Delete entry
    const { error } = await supabase
      .from('recipient_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting entry:', error);
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Action error:', error);
    return { error: 'Failed to delete entry' };
  }
}

/**
 * Get a single entry by ID
 */
export async function getEntryByIdAction(id: string) {
  try {
    const supabase = await createSupabaseServerClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('Auth error:', userError);
      return { error: `Authentication failed: ${userError.message}` };
    }

    if (!user) {
      console.error('No user found in session');
      return { error: 'User session not found. Please log in again.' };
    }

    const { data, error } = await supabase
      .from('recipient_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching entry:', error);
      return { error: error.message };
    }

    return { data: data as RecipientEntry };
  } catch (error) {
    console.error('Action error:', error);
    return { error: 'Failed to fetch entry' };
  }
}
