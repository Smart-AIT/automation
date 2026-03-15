import Link from 'next/link'
import React from 'react'

interface AuthLinkProps {
  text: string
  linkText: string
  href: string
}

export const AuthLink: React.FC<AuthLinkProps> = ({ text, linkText, href }) => {
  return (
    <div className="text-center text-gray-600">
      {text}{' '}
      <Link href={href} className="text-blue-600 hover:text-blue-700 font-medium">
        {linkText}
      </Link>
    </div>
  )
}
