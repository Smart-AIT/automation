import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-5xl font-bold text-gray-900">
            Birthday Automation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Automate and celebrate every birthday with ease
          </p>

          <div className="flex gap-4 justify-center pt-8">
            <Link
              href="/auth/sign-in"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="border-2 border-blue-600 hover:bg-blue-50 text-blue-600 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
