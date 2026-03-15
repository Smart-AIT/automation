'use client';

import { Trash2, Edit } from 'lucide-react';
import type { RecipientEntry } from '@/lib/types/dashboard';

interface DeliveryTableProps {
  entries: RecipientEntry[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function DeliveryTable({ entries, onDelete, isLoading = false }: DeliveryTableProps) {
  const getStatusBadge = (status: string) => {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

    switch (status) {
      case 'sent':
        return <span className={`${baseClass} bg-green-100 text-green-800`}>● Sent</span>;
      case 'pending':
        return <span className={`${baseClass} bg-amber-100 text-amber-800`}>● Pending</span>;
      case 'failed':
        return <span className={`${baseClass} bg-red-100 text-red-800`}>● Failed</span>;
      default:
        return <span className={`${baseClass} bg-gray-100 text-gray-800`}>● Unknown</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Date of Birth
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Custom Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Update
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Delete
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-700">
                        {entry.fullName.charAt(0).toUpperCase()}
                        {entry.fullName.split(' ')[1]?.charAt(0).toUpperCase() || entry.fullName.charAt(1).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{entry.fullName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{entry.phoneNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{formatDateOfBirth(entry.dateOfBirth)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="max-w-xs truncate" title={entry.customMessage}>
                    {entry.customMessage}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(entry.status)}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    className="p-2 text-gray-400 hover:text-blue-600 transition rounded hover:bg-blue-50"
                    title="Update entry"
                    onClick={() => {
                      // TODO: Implement update
                      console.log('Update entry:', entry.id);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    className="p-2 text-gray-400 hover:text-red-600 transition rounded hover:bg-red-50"
                    title="Delete entry"
                    onClick={() => onDelete(entry.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
