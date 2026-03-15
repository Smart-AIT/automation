'use client';

import { DashboardStatistics } from '@/lib/types/dashboard';

interface StatisticsCardsProps {
  statistics: DashboardStatistics;
}

export function StatisticsCards({ statistics }: StatisticsCardsProps) {
  const cards = [
    {
      label: 'Total Entries',
      value: statistics.totalEntries.toLocaleString(),
      bgClass: 'bg-blue-50',
      textClass: 'text-blue-900',
      borderClass: 'border-blue-200',
    },
    {
      label: 'Sent Till Now',
      value: statistics.sentTillNow.toLocaleString(),
      bgClass: 'bg-green-50',
      textClass: 'text-green-900',
      borderClass: 'border-green-200',
    },
    {
      label: 'Pending',
      value: statistics.pending.toLocaleString(),
      bgClass: 'bg-amber-50',
      textClass: 'text-amber-900',
      borderClass: 'border-amber-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bgClass} border ${card.borderClass} rounded-lg p-6 transition hover:shadow-md`}
        >
          <p className={`${card.textClass} text-sm font-medium mb-2`}>{card.label}</p>
          <p className={`${card.textClass} text-3xl font-bold`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
