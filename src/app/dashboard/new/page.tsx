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
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard"
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Record</h1>
              <p className="text-gray-600">
                Enter the contact information for automated birthday wishes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
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

          {/* Info Section */}
          <div className="space-y-6">
            {/* Card 1 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Fill in Details</h3>
                  <p className="text-sm text-gray-600">
                    Enter the contact's full name, phone number, and date of birth.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-700 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Customize Message
                  </h3>
                  <p className="text-sm text-gray-600">
                    Write a personalized birthday message that will be sent automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-700 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Automatic Delivery
                  </h3>
                  <p className="text-sm text-gray-600">
                    The system will automatically send the wish on the birthday date.
                  </p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Valid phone number with country code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Minimum 10 characters for message</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Date of birth must be in the past</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
