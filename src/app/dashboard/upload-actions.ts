'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import * as xlsx from 'xlsx';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

/**
 * Server action to handle uploading and parsing of CSV or XLSX files.
 * Extracts: full_name, phone_number, date_of_birth, custom_message
 * and inserts them into Supabase under the current user's ID with 'pending' status.
 */
export async function uploadFileAction(formData: FormData) {
  try {
    const file = formData.get('file') as File | null;
    if (!file) {
      return { error: 'No file provided' };
    }

    const supabase = await createSupabaseServerClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'Authentication failed. Please log in again.' };
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let parsedData: any[] = [];

    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      // Parse Excel
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      parsedData = xlsx.utils.sheet_to_json(worksheet);
    } else if (fileExtension === 'csv') {
      // Parse CSV
      parsedData = await new Promise((resolve, reject) => {
        const results: any[] = [];
        const stream = Readable.from(buffer);
        stream
          .pipe(csvParser())
          .on('data', (data) => results.push(data))
          .on('end', () => resolve(results))
          .on('error', (error) => reject(error));
      });
    } else {
      return { error: 'Invalid file format. Only CSV and Excel files are supported.' };
    }

    if (!parsedData || parsedData.length === 0) {
      return { error: 'File is empty or could not be parsed' };
    }

    // Process and map data to match schema
    const entriesToInsert = parsedData
      .map((row) => {
        // Handle potential variations in column names (case-insensitive mapping)
        const normalizeKey = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedRow: Record<string, any> = {};
        for (const key in row) {
          normalizedRow[normalizeKey(key)] = row[key];
        }

        // Map to our expected fields
        const full_name = normalizedRow['fullname'] || normalizedRow['name'] || '';
        const phone_number = normalizedRow['phonenumber'] || normalizedRow['phone'] || normalizedRow['contact'] || '';
        // Convert Excel dates if necessary or just store as string
        const date_of_birth = normalizedRow['dateofbirth'] || normalizedRow['dob'] || '';
        const custom_message = normalizedRow['custommessage'] || normalizedRow['message'] || 'Happy Birthday! Hope you have a fantastic day filled with joy and celebration...';

        return {
          user_id: user.id,
          full_name: String(full_name).trim(),
          phone_number: String(phone_number).trim(),
          date_of_birth: String(date_of_birth).trim(),
          custom_message: String(custom_message).trim(),
          status: 'pending',
        };
      })
      // Filter out empty rows (requiring at least full_name or phone_number)
      .filter((entry) => entry.full_name || entry.phone_number);

    if (entriesToInsert.length === 0) {
      return { error: 'No valid data found in the file. Ensure columns like Full Name, Phone Number exist.' };
    }

    // Insert into Supabase
    // We insert in chunks/bulk. Any duplicate phone number will throw an error.
    // To handle gracefully, we could use `.upsert` or check existing, 
    // but a bulk insert might fail the whole batch on one duplicate.
    const { error: insertError } = await supabase
      .from('recipient_entries')
      .insert(entriesToInsert);

    if (insertError) {
      console.error('Bulk insert error:', insertError);
      if (insertError.code === '23505') {
        return { error: 'One or more phone numbers in the file already exist (they must be unique).' };
      }
      return { error: `Database error: ${insertError.message}` };
    }

    return { success: true, count: entriesToInsert.length };
  } catch (error: any) {
    console.error('File upload action error:', error);
    return { error: error?.message || 'Failed to process file' };
  }
}
