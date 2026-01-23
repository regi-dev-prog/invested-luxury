import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6">
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

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="h-px w-16 bg-gold/40" />
          <span className="font-sans text-caption text-charcoal-light uppercase tracking-wider">
            or explore
          </span>
          <div className="h-px w-16 bg-gold/40" />
        </div>

        {/* Category Links */}
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          {[
            { name: 'Bags', href: '/bags' },
            { name: 'Shoes', href: '/shoes' },
            { name: 'Jewelry', href: '/jewelry' },
            { name: 'Watches', href: '/watches' },
            { name: 'Travel', href: '/travel' },
          ].map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="font-serif text-title text-black hover:text-gold transition-colors duration-300"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        {/* Subtle Brand Element */}
        <div className="mt-16 pt-8 border-t border-gold/20">
          <p className="font-sans text-caption text-charcoal-light">
            Need help? <Link href="/contact" className="text-gold hover:text-gold-dark transition-colors">Contact us</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
