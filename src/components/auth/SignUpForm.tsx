'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormInput } from './FormInput'
import { FormButton } from './FormButton'
import { ErrorAlert } from './ErrorAlert'
import { signUp } from '@/lib/utils/auth-service'
import { validateSignUpForm } from '@/lib/utils/validation'
import { SignUpFormData, FormErrors } from '@/lib/types/auth'

export const SignUpForm: React.FC = () => {
  const router = useRouter()
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isSignupSuccess, setIsSignupSuccess] = useState(false)
  const [signupEmail, setSignupEmail] = useState<string>('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setGeneralError(null)

    const validationErrors = validateSignUpForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)

    try {
      console.log('Signing up with email:', formData.email)
      const response = await signUp(formData)
      console.log('Sign up response:', response)

      if (response.error) {
        console.error('Sign up failed:', response.error)
        setGeneralError(response.error)
      } else {
        // Show success message instead of redirecting
        setIsSignupSuccess(true)
        setSignupEmail(formData.email)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSignupSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold mb-2">✓ Account Created!</p>
          <p className="text-green-700 text-sm mb-3">
            We've sent a confirmation email to <strong>{signupEmail}</strong>
          </p>
          <p className="text-green-700 text-sm mb-4">
            Click the link in the email to verify your account. It may take a few minutes to arrive.
          </p>
          <button
            onClick={() => setIsSignupSuccess(false)}
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            ← Back to sign up
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {generalError && (
        <ErrorAlert
          message={generalError}
          onDismiss={() => setGeneralError(null)}
        />
      )}

      <FormInput
        name="fullName"
        type="text"
        label="Full Name"
        placeholder="John Doe"
        value={formData.fullName}
        onChange={handleChange}
        error={errors.fullName}
        required
      />

      <FormInput
        name="email"
        type="email"
        label="Email address"
        placeholder="exmaple@gmail.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
      />

      <FormInput
        name="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required
      />

      <FormInput
        name="confirmPassword"
        type="password"
        label="Confirm Password"
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        required
      />

      <FormButton isLoading={isLoading}>Create Account</FormButton>
    </form>
  )
}
