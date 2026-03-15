'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  DashboardHeader,
  StatisticsCards,
  DeliveryTable,
  Pagination,
} from '@/components/dashboard';
import { getEntriesAction, deleteEntryAction } from '@/app/dashboard/actions';
import type { RecipientEntry, DashboardResponse } from '@/lib/types/dashboard';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Handle delete
  const handleDelete = useCallback(
    async (id: string) => {
      if (confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
        try {
          setIsDeleting(true);
          const result = await deleteEntryAction(id);
          if (result.error) {
            alert('Failed to delete entry: ' + result.error);
          } else {
            // Refresh data after delete
            fetchData(currentPage, searchQuery);
          }
        } catch (error) {
          console.error('Error deleting entry:', error);
          alert('An error occurred while deleting the entry');
        } finally {
          setIsDeleting(false);
        }
      }
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
        <div className="px-8 py-5.5">
          <DashboardHeader
            title="Dashboard"
            // subtitle="Overview of your successful birthday campaigns"
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        {/* Statistics Cards */}
        <StatisticsCards statistics={dashboardData.statistics} />

        {/* Table Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
