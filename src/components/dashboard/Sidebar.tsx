'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Send, Plus, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Sent',
      href: '/dashboard',
      icon: Send,
      active: pathname === '/dashboard',
    },
    {
      label: 'New Data',
      href: '/dashboard/new',
      icon: Plus,
      active: pathname === '/dashboard/new',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-9 py-7 border-b border-gray-200 flex items-center gap-2">
        <Image
          src="/ait 2.png"
          alt="AIT Logo"
          width={40}
          height={40}
          className="rounded-lg"
        />
        <h1 className="font-bold text-2xl text-gray-900">AutoRegards</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    item.active
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer with Sign Out */}
      <div className="p-4 border-t border-gray-200">
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
