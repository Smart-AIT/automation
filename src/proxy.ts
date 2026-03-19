import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
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

  // 🔥 Check user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // 🚫 Not logged in → block dashboard
  if (!user && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  // 🔁 Logged in → block login page
  if (user && path.startsWith('/auth/sign-in')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}


export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/sign-in',
    '/auth/:path*',
  ],
}