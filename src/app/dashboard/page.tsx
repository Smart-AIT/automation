'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  DashboardHeader,
  StatisticsCards,
  DeliveryTable,
  Pagination,
} from '@/components/dashboard';
import { getEntriesAction } from '@/app/dashboard/actions';
import type { RecipientEntry, DashboardResponse } from '@/lib/types/dashboard';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  // Fetch dashboard data
  const fetchData = useCallback(async (page: number, query: string) => {
    try {
      setIsLoading(true);
      const response = await getEntriesAction(page, 10, query, 'all');
      if (response.error) {
        console.error('Error:', response.error);
      } else {
        setDashboardData(response as DashboardResponse);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData(1, '');
  }, [fetchData]);

  // Handle search
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);
      fetchData(1, query);
    },
    [fetchData]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchData(page, searchQuery);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [searchQuery, fetchData]
  );

  // Handle delete - RefreshData after delete via modal's onSuccess
  const handleDelete = useCallback(
    async (id: string) => {
      // Modal handles deletion, this callback just refreshes data
      fetchData(currentPage, searchQuery);
    },
    [currentPage, searchQuery, fetchData]
  );

  if (isLoading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Failed to load dashboard data. Please try refreshing the page.</p>
          <button
            onClick={() => fetchData(1, '')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5.5">
          <DashboardHeader
            title="Dashboard"
            // subtitle="Overview of your successful birthday campaigns"
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        {/* Statistics Cards */}
        <StatisticsCards statistics={dashboardData.statistics} />

        {/* Table Section */}
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Detailed Delivery Status
          </h2>
          <DeliveryTable
            entries={dashboardData.entries}
            onDelete={handleDelete}
            onSuccess={() => fetchData(currentPage, searchQuery)}
            isLoading={isLoading}
          />
          {dashboardData.totalPages > 1 && (
            <Pagination
              currentPage={dashboardData.currentPage}
              totalPages={dashboardData.totalPages}
              hasMore={dashboardData.hasMore}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
