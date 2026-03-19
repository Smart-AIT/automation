import React from 'react'

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-6 sm:py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-5 sm:p-8">
        {children}
      </div>
    </div>
  )
}
