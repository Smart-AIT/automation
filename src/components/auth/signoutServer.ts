// app/actions/auth.ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function signOut() {
  (await cookies()).delete('sb-edlzolohwpxgshimjbzb-auth-token')

  redirect('/auth/sign-in')
}