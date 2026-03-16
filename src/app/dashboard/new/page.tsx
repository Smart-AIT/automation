'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { NewEntryForm } from '@/components/dashboard/NewEntryForm';
import { uploadFileAction } from '../upload-actions';
import { useToast } from '@/context/ToastContext';

export default function NewDataPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSuccess = () => {
    // Redirect to dashboard after successful form submission
    router.push('/dashboard');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await uploadFileAction(formData);

      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast(`Successfully uploaded ${result.count || 0} records!`, 'success');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      showToast('An unexpected error occurred during file upload.', 'error');
      console.error('File upload error:', error);
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6 flex justify-between items-center ">
          <div className="flex items-center gap-4 mt-1">
            <Link
              href="/dashboard"
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Add New Record</h1>
          </div>
          <div>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className='flex items-center gap-2 bg-blue-500 text-white border border-blue-600 hover:bg-blue-600 p-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isUploading ? 'Uploading...' : 'Upload CSV / XLSX'}
            </button>
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
            {/* <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">📝 Notes:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Phone numbers must be globally unique</li>
                <li>• Date of birth should be in YYYY-MM-DD format</li>
                <li>• Custom message supports up to 300 words</li>
                <li>• All entries start with "pending" status</li>
              </ul>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
