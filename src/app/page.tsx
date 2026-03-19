import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900 selection:bg-blue-100">
      {/* Minimal Header */}
      <nav className="flex items-center justify-between max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-lg font-semibold tracking-tight">SendBox</div>
        <div className="flex items-center gap-3 sm:gap-8">
          <Link href="/auth/sign-in" className="text-sm font-medium text-slate-600 hover:text-black transition">
            Sign in
          </Link>
          <Link 
            href="/auth/sign-in" 
            className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-slate-800 transition"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 md:pt-32 pb-12 sm:pb-20">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-4 sm:mb-6">
            Thoughtful automation for <span className="text-slate-400">every celebration.</span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-500 mb-6 sm:mb-10 leading-relaxed">
            A minimalist engine to manage birthdays, automate personal messages, and 
            strengthen your professional and personal circles—without the noise.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Link 
              href="/auth/sign-in" 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm text-center"
            >
              Start automating
            </Link>
            <span className="text-xs text-slate-400 font-mono uppercase tracking-widest sm:ml-2">
              Free forever for individuals
            </span>
          </div>
        </div>

        {/* Simple Visual Placeholder */}
        <div className="mt-12 sm:mt-16 md:mt-24 border-t border-slate-100 pt-8 sm:pt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { label: 'Import', desc: 'Sync contacts from CSV or Google.' },
              { label: 'Schedule', desc: 'Write once, deliver on time.' },
              { label: 'Notify', desc: 'Get reminded where you work.' }
            ].map((feature) => (
              <div key={feature.label}>
                <h3 className="text-sm font-bold mb-2 uppercase tracking-wider text-slate-400">{feature.label}</h3>
                <p className="text-slate-600 leading-snug">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}