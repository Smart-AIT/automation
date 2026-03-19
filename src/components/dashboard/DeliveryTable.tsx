'use client';

import { useState } from 'react';
import { Trash2, Edit } from 'lucide-react';
import type { RecipientEntry } from '@/lib/types/dashboard';
import { EditEntryModal } from './EditEntryModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface DeliveryTableProps {
  entries: RecipientEntry[];
  onDelete: (id: string) => void;
  onSuccess?: () => void;
  isLoading?: boolean;
}

export function DeliveryTable({ entries, onDelete, onSuccess, isLoading = false }: DeliveryTableProps) {
  const [selectedEntry, setSelectedEntry] = useState<RecipientEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteEntry, setDeleteEntry] = useState<RecipientEntry | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleEditClick = (entry: RecipientEntry) => {
    setSelectedEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEntry(null);
  };

  const handleDeleteClick = (entry: RecipientEntry) => {
    setDeleteEntry(entry);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteEntry(null);
  };

  const handleUpdateSuccess = () => {
    onSuccess?.();
  };

  const handleDeleteSuccess = () => {
    onSuccess?.();
  };
  const getStatusBadge = (status: string) => {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

    switch (status) {
      case 'sent':
        return <span className={`${baseClass} bg-green-100 text-green-800`}>● Sent</span>;
      case 'pending':
        return <span className={`${baseClass} bg-amber-100 text-amber-800`}>● Pending</span>;
      default:
        return <span className={`${baseClass} bg-gray-100 text-gray-800`}>● Unknown</span>;
    }
  };

  const formatDateOfBirth = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[Number.parseInt(month) - 1]} ${day}, ${year}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Loading entries...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No entries found. Start by adding a new record!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto -mx-px">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Date of Birth
              </th>
              <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Custom Message
              </th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Update
              </th>
              <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Delete
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50 transition">
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <span className="text-xs sm:text-sm font-semibold text-blue-700">
                        {entry.full_name.charAt(0).toUpperCase()}
                        {entry.full_name.split(' ')[1]?.charAt(0).toUpperCase() || entry.full_name.charAt(1).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 text-sm sm:text-base">{entry.full_name}</span>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{entry.phone_number}</td>
                <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{formatDateOfBirth(entry.date_of_birth)}</td>
                <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">
                  <div className="max-w-xs truncate" title={entry.custom_message}>
                    {entry.custom_message}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">{getStatusBadge(entry.status)}</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                  <button
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 transition rounded hover:bg-blue-50"
                    title="Update entry"
                    onClick={() => handleEditClick(entry)}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                  <button
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 transition rounded hover:bg-red-50"
                    title="Delete entry"
                    onClick={() => handleDeleteClick(entry)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditEntryModal 
        entry={selectedEntry}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleUpdateSuccess}
      />

      <DeleteConfirmationModal
        entry={deleteEntry}
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
