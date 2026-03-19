'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { deleteEntryAction } from '@/app/dashboard/actions';
import { useToast } from '@/context/ToastContext';
import type { RecipientEntry } from '@/lib/types/dashboard';

interface DeleteConfirmationModalProps {
  entry: RecipientEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteConfirmationModal({
  entry,
  isOpen,
  onClose,
  onSuccess,
}: DeleteConfirmationModalProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!entry) return;

    setIsLoading(true);

    try {
      const result = await deleteEntryAction(entry.id);

      if (result.error) {
        showToast('Failed to delete entry: ' + result.error, 'error');
      } else {
        showToast('Entry deleted successfully!', 'success');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 500);
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      showToast('An error occurred while deleting the entry', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-w-md w-full">
        {/* Header with warning icon */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Delete Entry</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <p className="text-gray-700 mb-2">
            Are you sure you want to delete this entry?
          </p>
          <p className="text-sm text-gray-600 mb-6">
            <span className="font-semibold">{entry.full_name}</span> will be permanently removed. This action cannot be undone.
          </p>

          {/* Entry details for confirmation */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Phone: </span>
                <span className="font-medium text-gray-900">{entry.phone_number}</span>
              </div>
              <div>
                <span className="text-gray-600">Date of Birth: </span>
                <span className="font-medium text-gray-900">{entry.date_of_birth}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
