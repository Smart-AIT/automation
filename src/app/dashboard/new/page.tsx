'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { NewEntryForm } from '@/components/dashboard/NewEntryForm';
import { createEntry } from '@/lib/services/dashboard';
import type { CreateEntryPayload } from '@/lib/types/dashboard';

export default function NewDataPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (formData: CreateEntryPayload) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      await createEntry(formData);

      setSuccessMessage('Record created successfully!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error creating entry:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to create record'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4 mt-1">
            <Link
              href="/dashboard"
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Add New Record</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Form Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">{errorMessage}</p>
              </div>
            )}

            <NewEntryForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
