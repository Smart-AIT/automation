'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Send, Plus, LogOut, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { signOut } from '../auth/signoutServer';
import { useState, useEffect } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static z-50 md:z-auto
          w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}
      >
        {/* Header */}
        <div className="px-9 py-7 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/ait 2.png"
              alt="AIT Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <h1 className="font-bold text-2xl text-gray-900">SendBox</h1>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
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
          <form action={signOut}>
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
    </>
  );
}
