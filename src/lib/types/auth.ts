export interface AuthUser {
  id: string
  email: string
  fullName?: string
  createdAt: string
}

export interface AuthResponse {
  user: AuthUser | null
  error: string | null
}

export interface SignUpFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export interface SignInFormData {
  email: string
  password: string
}

export interface FormErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}
