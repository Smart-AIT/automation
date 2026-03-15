import React from 'react'

interface GoogleAuthButtonProps {
  onClick?: () => void
  isLoading?: boolean
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onClick,
  isLoading,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <text x="0" y="20" fontSize="24" fontWeight="bold" fill="#4285F4">
          G
        </text>
      </svg>
      Continue with Google
    </button>
  )
}
