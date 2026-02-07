import Link from 'next/link';
import FooterNewsletterForm from '@/components/FooterNewsletterForm';
const footerLinks = {
  fashion: [
    { label: 'Bags', href: '/fashion/bags' },
    { label: 'Shoes', href: '/fashion/shoes' },
    { label: 'Quiet Luxury', href: '/fashion/quiet-luxury' },
    { label: 'Watches', href: '/fashion/watches' },
    { label: 'Jewelry', href: '/fashion/jewelry' },
    { label: 'Clothing', href: '/fashion/clothing' },
    { label: 'Accessories', href: '/fashion/accessories' },
  ],
  lifestyle: [
    { label: 'Hotels', href: '/lifestyle/hotels' },
    { label: 'Travel', href: '/lifestyle/travel' },
    { label: 'Art & Photography', href: '/lifestyle/art-photography' },
  ],
  wellness: [
    { label: 'Longevity', href: '/wellness/longevity' },
    { label: 'Retreats', href: '/wellness/retreats' },
    { label: 'Biohacking', href: '/wellness/biohacking' },
  ],
  guides: [
    { label: 'Gift Guides', href: '/guides/gift-guides' },
    { label: 'Beginner Guides', href: '/guides/beginner-guides' },
    { label: 'Seasonal Guides', href: '/guides/seasonal-guides' },
    { label: 'Investment Guides', href: '/guides/investment-guides' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container-luxury py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-serif text-headline mb-4">
              Join the Inner Circle
            </h3>
            <p className="text-white/70 mb-8">
              Receive curated insights on investment-worthy pieces, exclusive access to luxury guides, and early previews of our latest editorial content.
            </p>
            <FooterNewsletterForm />
            <p className="text-caption text-white/50 mt-4">
              By subscribing, you agree to our Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      {/* Links Section */}
      <div className="container-luxury py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Fashion */}
          <div>
            <h4 className="font-serif text-lg mb-6 text-gold">Fashion</h4>
            <ul className="space-y-3">
              {footerLinks.fashion.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-white/70 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Lifestyle */}
          <div>
            <h4 className="font-serif text-lg mb-6 text-gold">Lifestyle</h4>
            <ul className="space-y-3">
              {footerLinks.lifestyle.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-white/70 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Wellness */}
          <div>
            <h4 className="font-serif text-lg mb-6 text-gold">Wellness</h4>
            <ul className="space-y-3">
              {footerLinks.wellness.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-white/70 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Guides */}
          <div>
            <h4 className="font-serif text-lg mb-6 text-gold">Guides</h4>
            <ul className="space-y-3">
              {footerLinks.guides.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-white/70 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-serif text-lg mb-6 text-gold">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-white/70 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-white/10">
        <div className="container-luxury py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="font-serif text-xl">
              <span className="text-gold">I</span>nvested<span className="text-gold">L</span>uxury
            </Link>

            {/* Copyright */}
            <p className="text-caption text-white/50 text-center">
              © {currentYear} InvestedLuxury. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-6">
              <a 
                href="https://pinterest.com/investedlux/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/70 hover:text-gold transition-colors"
                aria-label="Pinterest"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/invested_luxury/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/70 hover:text-gold transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}