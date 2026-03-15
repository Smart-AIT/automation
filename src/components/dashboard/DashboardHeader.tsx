'use client';

import { Bell, Search } from 'lucide-react';
import { useCallback } from 'react';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onSearch?: (query: string) => void;
}

export function DashboardHeader({ title, subtitle, onSearch }: DashboardHeaderProps) {
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
        <button className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition relative">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </div>
  );
}
