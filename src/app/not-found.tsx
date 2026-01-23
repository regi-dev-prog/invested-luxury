import Link from 'next/link'
import { getLatestArticles } from '@/lib/queries/queries'

export default async function NotFound() {
  // Fetch 3 latest articles
  const latestArticles = await getLatestArticles(3)

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-20">
      <div className="max-w-2xl mx-auto text-center animate-fade-in">
        {/* Elegant 404 Display */}
        <p className="font-sans text-gold text-caption uppercase tracking-[0.3em] mb-6">
          Page Not Found
        </p>
        
        <h1 className="font-serif text-display text-black mb-6">
          This page has moved on to better things
        </h1>
        
        <p className="font-sans text-body text-charcoal mb-12 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been relocated. 
          Let us help you find what you're searching for.
        </p>

        {/* Primary CTA */}
        <Link 
          href="/"
          className="inline-block bg-black text-white font-sans text-caption uppercase tracking-wider px-8 py-4 hover:bg-charcoal transition-colors duration-300 mb-12"
        >
          Return Home
        </Link>

        {/* Latest Articles Section */}
        {latestArticles && latestArticles.length > 0 && (
          <>
            {/* Divider */}
            <div className="flex items-center justify-center gap-4 mb-10">
              <div className="h-px w-16 bg-gold/40" />
              <span className="font-sans text-caption text-charcoal-light uppercase tracking-wider">
                or read our latest
              </span>
              <div className="h-px w-16 bg-gold/40" />
            </div>

            {/* Articles List */}
            <div className="space-y-6 text-left">
              {latestArticles.map((article: {
                _id: string
                title: string
                slug: string
                excerpt?: string
                categories?: string[]
              }) => (
                <Link
                  key={article._id}
                  href={`/article/${article.slug}`}
                  className="block group p-6 bg-white hover:bg-white/80 transition-colors duration-300"
                >
                  <h3 className="font-serif text-title text-black group-hover:text-gold transition-colors duration-300 mb-2">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="font-sans text-caption text-charcoal line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Contact Footer */}
        <div className="mt-12 pt-8 border-t border-gold/20">
          <p className="font-sans text-caption text-charcoal-light">
            Need help?{' '}
            <Link href="/contact" className="text-gold hover:text-gold-dark transition-colors">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}