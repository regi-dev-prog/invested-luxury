'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Search } from 'lucide-react';

const navigation = [
  { 
    label: 'Fashion', 
    href: '/fashion',
    children: [
      { label: 'Bags', href: '/fashion/bags' },
      { label: 'Shoes', href: '/fashion/shoes' },
      { label: 'Quiet Luxury', href: '/fashion/quiet-luxury' },
      { label: 'Watches', href: '/fashion/watches' },
      { label: 'Jewelry', href: '/fashion/jewelry' },
      { label: 'Clothing', href: '/fashion/clothing' },
      { label: 'Accessories', href: '/fashion/accessories' },
    ]
  },
  { 
    label: 'Lifestyle', 
    href: '/lifestyle',
    children: [
      { label: 'Hotels', href: '/lifestyle/hotels' },
      { label: 'Travel', href: '/lifestyle/travel' },
      { label: 'Art & Photography', href: '/lifestyle/art' },
    ]
  },
  { 
    label: 'Wellness', 
    href: '/wellness',
    children: [
      { label: 'Longevity', href: '/wellness/longevity' },
      { label: 'Retreats', href: '/wellness/retreats' },
      { label: 'Biohacking', href: '/wellness/biohacking' },
    ]
  },
  { 
    label: 'Guides', 
    href: '/guides',
    children: [
      { label: 'Gift Guides', href: '/guides/gift-guides' },
      { label: 'Beginner Guides', href: '/guides/beginners' },
      { label: 'Seasonal Guides', href: '/guides/seasonal' },
      { label: 'Investment Guides', href: '/guides/investment' },
    ]
  },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Top bar - Affiliate Disclosure - More subtle */}
      <div className="bg-cream/70 text-center py-1.5 px-4 border-b border-gray-100">
        <p className="text-xs text-charcoal-light">
          We may earn commission on purchases.{' '}
          <Link href="/about#affiliate-disclosure" className="underline hover:text-gold">
            Learn more
          </Link>
        </p>
      </div>

      <div className="container-luxury border-b border-gray-100">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="font-serif text-2xl font-medium tracking-tight">
              <span className="text-gold">I</span>nvested<span className="text-gold">L</span>uxury
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <div 
                key={item.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link 
                  href={item.href}
                  className="text-sm font-sans font-medium uppercase tracking-widest text-charcoal hover:text-gold transition-colors py-2"
                >
                  {item.label}
                </Link>
                
                {/* Dropdown */}
                {item.children && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 pt-2 animate-fade-in">
                    <div className="bg-white border border-gray-100 shadow-lg py-3 min-w-[200px]">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-6 py-2 text-sm text-charcoal hover:text-gold hover:bg-cream transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right side - Search & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 text-charcoal hover:text-gold transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Mobile menu button */}
            <button 
              className="lg:hidden p-2 text-charcoal hover:text-gold transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 animate-fade-in">
          <div className="container-luxury py-6">
            {navigation.map((item) => (
              <div key={item.label} className="mb-4">
                <Link 
                  href={item.href}
                  className="block text-lg font-serif font-medium text-black mb-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="ml-4 space-y-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block text-sm text-charcoal hover:text-gold"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
