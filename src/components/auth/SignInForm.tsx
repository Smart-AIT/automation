'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormInput } from './FormInput'
import { FormButton } from './FormButton'
import { ErrorAlert } from './ErrorAlert'
import { signIn } from '@/lib/utils/auth-service'
import { validateSignInForm } from '@/lib/utils/validation'
import { SignInFormData, FormErrors } from '@/lib/types/auth'

export const SignInForm: React.FC = () => {
  const router = useRouter()
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)

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

    const validationErrors = validateSignInForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)

    try {
      const response = await signIn(formData)

      if (response.error) {
        setGeneralError(response.error)
      } else {
        // Redirect to dashboard
        router.push('/dashboard')
      }
    } finally {
      setIsLoading(false)
    }
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
        name="email"
        type="email"
        label="Email address"
        placeholder="example@gmail.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
      />

      <div>
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
        <div className="mt-1 text-right">
          <a
            href="#"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Forgot password?
          </a>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="remember"
          className="w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        />
        <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
          Keep me logged in
        </label>
      </div>

      <FormButton isLoading={isLoading}>Sign In</FormButton>
    </form>
  )
}
