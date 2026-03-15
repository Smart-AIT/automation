'use server'

import { supabase } from '../supabase/client'
import { AuthResponse, SignUpFormData, SignInFormData } from '../types/auth'

export async function signUp(data: SignUpFormData): Promise<AuthResponse> {
  try {
    // When email confirmation is enabled in Supabase:
    // 1. This creates the user
    // 2. User status = "unconfirmed"
    // 3. Supabase sends confirmation email automatically
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
        // Optional: Set redirect URL after email confirmation
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (signUpError) {
      console.error('Sign Up Error:', {
        message: signUpError.message,
        code: signUpError.status,
        details: signUpError,
      })
      return {
        user: null,
        error: signUpError.message,
      }
    }

    if (!authData.user) {
      return {
        user: null,
        error: 'Failed to create account',
      }
    }

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email || '',
        fullName: data.fullName,
        createdAt: authData.user.created_at,
      },
      error: null,
    }
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : 'An error occurred',
    }
  }
}

export async function signIn(data: SignInFormData): Promise<AuthResponse> {
  try {
    const { data: authData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

    if (signInError) {
      console.error('Sign In Error:', {
        message: signInError.message,
        code: signInError.status,
        details: signInError,
      })
      return {
        user: null,
        error: signInError.message,
      }
    }

    // ✅ NEW: Check if email is confirmed
    if (authData.user && !authData.user.email_confirmed_at) {
      return {
        user: null,
        error: 'Please confirm your email before signing in. Check your inbox.',
      }
    }

    if (!authData.user) {
      return {
        user: null,
        error: 'Failed to sign in',
      }
    }

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email || '',
        fullName: authData.user.user_metadata?.full_name,
        createdAt: authData.user.created_at,
      },
      error: null,
    }
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : 'An error occurred',
    }
  }
}

export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'An error occurred',
    }
  }
}
