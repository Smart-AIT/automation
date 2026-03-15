import Image from 'next/image'
import React from 'react'

interface AuthHeaderProps {
  title: string
  subtitle: string
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-6">
        <Image
          src="/ait 2.png"
          alt="Birthday Automation Logo"
          width={60}
          height={60}
          priority
        />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600">{subtitle}</p>
    </div>
  )
}
