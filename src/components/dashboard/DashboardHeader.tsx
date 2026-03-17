'use client';

import { Bell, Search, X } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import type { RecipientEntry } from '@/lib/types/dashboard';
import { getEntriesAction } from '@/app/dashboard/actions';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onSearch?: (query: string) => void;
}

export function DashboardHeader({ title, subtitle, onSearch }: DashboardHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<RecipientEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch sent entries (notifications)
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getEntriesAction(1, 100, '', 'sent'); // Fetch only "sent" status
      if (response.entries) {
        setNotifications(response.entries);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications, fetchNotifications]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onSearch) {
        onSearch(e.target.value);
      }
    },
    [onSearch]
  );

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{title}</h1>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        {onSearch && (
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        )}
        
        {/* Bell Notification */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition relative"
          >
            <Bell className="w-6 h-6" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full font-bold">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Sent Wishes ({notifications.length})</h3>
                <button onClick={() => setShowNotifications(false)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No sent wishes yet</div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-3 hover:bg-gray-50 cursor-pointer">
                      <p className="font-medium text-sm text-gray-900">{notif.full_name}</p>
                      <p className="text-xs text-gray-600">📱 {notif.phone_number}</p>
                      <p className="text-xs text-green-600 mt-1">✓ Wish sent</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
