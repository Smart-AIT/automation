import { FormErrors, SignUpFormData, SignInFormData } from '../types/auth'

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): string | null => {
  if (password.length < 6) {
    return 'Password must be at least 6 characters'
  }
  return null
}

export const validateSignUpForm = (data: SignUpFormData): FormErrors => {
  const errors: FormErrors = {}

  if (!data.fullName.trim()) {
    errors.fullName = 'Full name is required'
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters'
  }

  if (!data.email.trim()) {
    errors.email = 'Email is required'
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email'
  }

  if (!data.password) {
    errors.password = 'Password is required'
  } else {
    const passwordError = validatePassword(data.password)
    if (passwordError) {
      errors.password = passwordError
    }
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return errors
}

export const validateSignInForm = (data: SignInFormData): FormErrors => {
  const errors: FormErrors = {}

  if (!data.email.trim()) {
    errors.email = 'Email is required'
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email'
  }

  if (!data.password) {
    errors.password = 'Password is required'
  }

  return errors
}
