'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  DashboardHeader,
  SearchBar,
  StatisticsCards,
  DeliveryTable,
  Pagination,
} from '@/components/dashboard';
import { getDashboardData } from '@/lib/services/dashboard';
import type { DashboardResponse } from '@/lib/types/dashboard';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch dashboard data
  const fetchData = useCallback(async (page: number, query: string) => {
    try {
      setIsLoading(true);
      const response = await getDashboardData({
        page,
        pageSize: 10,
        searchQuery: query,
        status: 'all',
      });
      setDashboardData(response);
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
  const handleDelete = useCallback((id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      // TODO: Implement actual delete
      console.log('Delete entry:', id);
      // Refresh data after delete
      fetchData(currentPage, searchQuery);
    }
  }, [currentPage, searchQuery, fetchData]);

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <DashboardHeader
            title="Sent Dashboard"
            subtitle="Overview of your successful birthday campaigns"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8 max-w-md">
          <SearchBar
            placeholder="Search contacts..."
            onSearch={handleSearch}
          />
        </div>

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
