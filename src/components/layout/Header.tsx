'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ============================================================================
// NAVIGATION DATA
// ============================================================================

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
    ],
  },
  {
    label: 'Lifestyle',
    href: '/lifestyle',
    children: [
      { label: 'Hotels', href: '/lifestyle/hotels' },
      { label: 'Travel', href: '/lifestyle/travel' },
      { label: 'Art & Photography', href: '/lifestyle/art-photography' },
    ],
  },
  {
    label: 'Wellness',
    href: '/wellness',
    children: [
      { label: 'Longevity', href: '/wellness/longevity' },
      { label: 'Retreats', href: '/wellness/retreats' },
      { label: 'Biohacking', href: '/wellness/biohacking' },
    ],
  },
  { label: 'Guides', href: '/guides' },
];

const secondaryLinks = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

// ============================================================================
// SEARCH ICON
// ============================================================================

function SearchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

// ============================================================================
// CLOSE ICON
// ============================================================================

function CloseIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

// ============================================================================
// MENU ICON (hamburger)
// ============================================================================

function MenuIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

// ============================================================================
// CHEVRON ICON
// ============================================================================

function ChevronIcon({ size = 16, direction = 'down' }: { size?: number; direction?: 'down' | 'right' }) {
  const rotation = direction === 'right' ? '-90' : '0';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ============================================================================
// PLUS ICON (for expandable menu items)
// ============================================================================

function PlusIcon({ size = 16, expanded = false }: { size?: number; expanded?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={`transition-transform duration-200 ${expanded ? 'rotate-45' : ''}`}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ============================================================================
// HEADER COMPONENT
// ============================================================================

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when menu or search is open
  useEffect(() => {
    if (menuOpen || searchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, searchOpen]);

  // Focus search input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 300);
    }
  }, [searchOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const closeAll = () => {
    setMenuOpen(false);
    setSearchOpen(false);
    setExpandedItems(new Set());
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      closeAll();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white">
        {/* Top bar - Affiliate Disclosure */}
        <div className="bg-cream/70 text-center py-1.5 px-4 border-b border-gray-100">
          <p className="text-xs text-charcoal-light">
            We may earn commission on purchases.{' '}
            <Link href="/about#affiliate-disclosure" className="underline hover:text-gold transition-colors">
              Learn more
            </Link>
          </p>
        </div>

        {/* ============================================================ */}
        {/* MAIN HEADER BAR                                               */}
        {/* ============================================================ */}
        <div className="border-b border-gray-100">
          <div className="container-luxury">
            <nav className="flex items-center justify-between h-16 md:h-20">
              {/* LEFT: Subscribe button */}
              <div className="flex items-center">
                <a
                  href="#newsletter"
                  className="px-4 py-1.5 bg-black text-white text-xs font-sans font-medium uppercase tracking-wider hover:bg-charcoal transition-colors"
                >
                  Subscribe
                </a>
              </div>

              {/* CENTER: Logo */}
              <Link href="/" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:flex-1 md:flex md:justify-center">
                <span className="font-serif text-xl md:text-2xl lg:text-3xl font-medium tracking-tight">
                  <span className="text-gold">I</span>nvested<span className="text-gold">L</span>uxury
                </span>
              </Link>

              {/* RIGHT: Search + Menu */}
              <div className="flex items-center gap-3 md:gap-4">
                {/* Search button */}
                <button
                  onClick={() => {
                    setSearchOpen(true);
                    setMenuOpen(false);
                  }}
                  className="p-1.5 text-charcoal hover:text-gold transition-colors"
                  aria-label="Search"
                >
                  <SearchIcon size={20} />
                </button>

                {/* Menu button */}
                <button
                  onClick={() => {
                    setMenuOpen(!menuOpen);
                    setSearchOpen(false);
                  }}
                  className="flex items-center gap-2 p-1.5 text-charcoal hover:text-gold transition-colors"
                  aria-label="Toggle menu"
                >
                  <span className="hidden md:inline text-xs font-sans font-medium uppercase tracking-wider">
                    {menuOpen ? 'Close' : 'Menu'}
                  </span>
                  {menuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* ============================================================ */}
        {/* DESKTOP NAV LINKS ROW with hover dropdowns                    */}
        {/* ============================================================ */}
        <div className="hidden lg:block border-b border-gray-100 relative">
          <div className="container-luxury">
            <div className="flex items-center justify-center gap-8 h-12">
              {navigation.map((item) => (
                <div key={item.label} className="relative group h-full flex items-center">
                  <Link
                    href={item.href}
                    className="text-xs font-sans font-medium uppercase tracking-widest text-charcoal hover:text-gold transition-colors"
                  >
                    {item.label}
                  </Link>

                  {item.children && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="bg-white border border-gray-100 shadow-lg py-3 min-w-[200px] mt-0">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-6 py-2 text-sm text-charcoal hover:text-gold hover:bg-cream/50 transition-colors"
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
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* BACKDROP OVERLAY                                                */}
      {/* ============================================================== */}
      {(menuOpen || searchOpen) && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
          onClick={closeAll}
        />
      )}

      {/* ============================================================== */}
      {/* SEARCH OVERLAY                                                  */}
      {/* ============================================================== */}
      <div
        className={`fixed top-0 left-0 right-0 bg-white z-50 transition-all duration-300 ease-out ${
          searchOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
      >
        <div className="container-luxury py-8 md:py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl text-black">Search</h2>
            <button
              onClick={() => setSearchOpen(false)}
              className="p-2 text-charcoal hover:text-gold transition-colors"
              aria-label="Close search"
            >
              <CloseIcon size={24} />
            </button>
          </div>
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, brands, categories..."
                className="w-full border-b-2 border-black pb-3 text-lg md:text-xl font-serif bg-transparent focus:outline-none focus:border-gold transition-colors placeholder:text-charcoal-light"
              />
              <button
                type="submit"
                className="absolute right-0 bottom-3 text-charcoal hover:text-gold transition-colors"
                aria-label="Submit search"
              >
                <SearchIcon size={22} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SLIDE-IN MENU (from right)                                      */}
      {/* ============================================================== */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] md:w-[480px] bg-white z-50 shadow-2xl overflow-y-auto transition-transform duration-300 ease-out ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between px-6 md:px-10 h-16 md:h-20 border-b border-gray-100">
          <Link href="/" onClick={closeAll} className="font-serif text-xl font-medium tracking-tight">
            <span className="text-gold">I</span>nvested<span className="text-gold">L</span>uxury
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 p-1.5 text-charcoal hover:text-gold transition-colors"
            aria-label="Close menu"
          >
            <span className="hidden md:inline text-xs font-sans font-medium uppercase tracking-wider">Close</span>
            <CloseIcon size={22} />
          </button>
        </div>

        {/* Menu Content */}
        <div className="px-6 md:px-10 py-6">
          {/* Primary Navigation */}
          {navigation.map((item) => (
            <div key={item.label} className="border-b border-gray-100">
              {item.children ? (
                <>
                  {/* Parent with children - expandable */}
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className="flex items-center justify-between w-full py-4 text-left"
                  >
                    <span className="text-sm font-sans font-semibold uppercase tracking-wider text-black">
                      {item.label}
                    </span>
                    <PlusIcon size={18} expanded={expandedItems.has(item.label)} />
                  </button>

                  {/* Children */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-out ${
                      expandedItems.has(item.label)
                        ? 'max-h-96 opacity-100 pb-4'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="pl-4 space-y-3">
                      {/* View all link */}
                      <Link
                        href={item.href}
                        onClick={closeAll}
                        className="block text-sm text-charcoal hover:text-gold transition-colors"
                      >
                        View All {item.label}
                      </Link>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={closeAll}
                          className="block text-sm text-charcoal hover:text-gold transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Simple link without children */
                <Link
                  href={item.href}
                  onClick={closeAll}
                  className="block py-4 text-sm font-sans font-semibold uppercase tracking-wider text-black hover:text-gold transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}

          {/* Divider + Secondary Section */}
          <div className="mt-8 mb-4">
            <p className="text-xs font-sans uppercase tracking-wider text-charcoal-light mb-4">
              More
            </p>
          </div>

          <div className="space-y-4">
            {secondaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeAll}
                className="block text-sm font-sans font-semibold uppercase tracking-wider text-black hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search in menu */}
          <div className="mt-10 pt-8 border-t border-gray-100">
            <button
              onClick={() => {
                setMenuOpen(false);
                setTimeout(() => setSearchOpen(true), 300);
              }}
              className="flex items-center gap-3 text-sm text-charcoal hover:text-gold transition-colors"
            >
              <SearchIcon size={18} />
              <span>Search</span>
            </button>
          </div>

          {/* Subscribe in menu */}
          <div className="mt-6">
            <a
              href="#newsletter"
              onClick={closeAll}
              className="flex items-center gap-3 text-sm text-charcoal hover:text-gold transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>Subscribe to Newsletter</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}