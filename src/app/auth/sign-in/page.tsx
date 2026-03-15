import React from 'react'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { SignInForm } from '@/components/auth/SignInForm'
import { AuthLink } from '@/components/auth/AuthLink'

export const metadata = {
  title: 'Sign In - Birthday Automation',
  description: 'Sign in to your Birthday Automation account',
}

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <AuthHeader
        title="Birthday Automation"
        subtitle="Enter your details to access your dashboard"
      />

      <SignInForm />

      <AuthLink
        text="Don't have an account?"
        linkText="Create account"
        href="/auth/sign-up"
      />
    </div>
  )
}
