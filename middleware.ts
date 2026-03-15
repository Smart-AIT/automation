import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as CookieOptions),
          )
        },
      },
    },
  )

  // Refresh session to keep user logged in
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    // Protect dashboard routes
    '/dashboard/:path*',
    // Include sign-in and sign-up for session refresh
    '/auth/:path*',
  ],
}
