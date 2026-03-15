import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Test connection by querying auth status
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError && userError.message !== 'Auth session missing!') {
      return Response.json(
        { success: false, error: userError.message },
        { status: 400 }
      )
    }

    return Response.json({
      success: true,
      message: 'Supabase connection successful! ✅',
      details: 'You are connected to Supabase'
    })
  } catch (error) {
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}