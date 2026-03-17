import React from 'react'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { AuthLink } from '@/components/auth/AuthLink'

export const metadata = {
  title: 'SendBox',
  description: 'Start automating your birthday celebrations with SendBox',
}

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <AuthHeader
        title="Create Account"
        subtitle="Start automating your celebrations today"
      />

      <SignUpForm />

      <AuthLink
        text="Already have an account?"
        linkText="Sign in here"
        href="/auth/sign-in"
      />
    </div>
  )
}
