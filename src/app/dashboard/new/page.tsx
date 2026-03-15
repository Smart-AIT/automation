'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { NewEntryForm } from '@/components/dashboard/NewEntryForm';

export default function NewDataPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect to dashboard after successful form submission
    router.push('/dashboard');
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
            <NewEntryForm onSuccess={handleSuccess} />

            {/* Instructions */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">📝 Notes:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Phone numbers must be globally unique</li>
                <li>• Date of birth should be in YYYY-MM-DD format</li>
                <li>• Custom message supports up to 300 words</li>
                <li>• All entries start with "pending" status</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
