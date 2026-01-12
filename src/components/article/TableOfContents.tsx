'use client';

import { useState } from 'react';
import { ChevronDown, ShoppingBag } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
  isBuySection?: boolean;
}

interface TableOfContentsProps {
  items: TOCItem[];
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Safety check - return null if items is undefined or empty
  if (!items || items.length === 0) return null;

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="my-10 border border-gray-200 bg-[#FAF9F6]">
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 md:hidden"
      >
        <span className="text-sm font-medium uppercase tracking-wider">In This Article</span>
        <ChevronDown 
          size={18} 
          className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Content */}
      <div className={`${isExpanded ? 'block' : 'hidden'} md:block p-4 md:p-6 pt-0 md:pt-6`}>
        <p className="hidden md:block text-xs font-medium uppercase tracking-widest text-gray-500 mb-4">
          In This Article
        </p>
        <ol className="space-y-2">
          {items.map((item, index) => (
            <li key={item.id}>
              <button
                onClick={() => handleClick(item.id)}
                className={`text-left w-full flex items-center gap-3 py-1.5 text-sm transition-colors ${
                  item.isBuySection 
                    ? 'text-[#C9A227] font-medium hover:text-black' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <span className="text-xs text-gray-400 w-5">{index + 1}.</span>
                {item.isBuySection && <ShoppingBag size={14} />}
                <span>{item.text}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}