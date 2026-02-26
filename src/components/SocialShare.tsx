'use client';

import { useState } from 'react';
import { trackSocialShare } from '@/lib/analytics';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
}

export default function SocialShare({ 
  url, 
  title, 
  description = '', 
  image = '' 
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedImage = encodeURIComponent(image);
  
  const shareLinks = {
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`,
    x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleInstagramShare = async () => {
    const textToCopy = `${title}\n\n${description}\n\n${url}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      window.open('https://instagram.com', '_blank');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform: string) => {
    trackSocialShare({ platform, contentTitle: title });
    if (platform === 'instagram') {
      handleInstagramShare();
      return;
    }
    window.open(shareLinks[platform as keyof typeof shareLinks], '_blank', 'width=600,height=400');
  };

  return (
    <>
      <div className="flex items-center justify-between pt-6 mt-8 border-t border-gray-200">
        <span className="text-sm text-gray-500 uppercase tracking-wider font-medium">
          Share
        </span>
        
        <div className="flex items-center gap-4">
          {/* Pinterest */}
          <button 
            onClick={() => handleShare('pinterest')}
            aria-label="Share on Pinterest"
            className="w-8 h-8 rounded-full border-[1.5px] border-black bg-transparent flex items-center justify-center transition-all duration-200 hover:bg-black group"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-black transition-all duration-200 group-hover:fill-white">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
            </svg>
          </button>

          {/* Instagram */}
          <button 
            onClick={() => handleShare('instagram')}
            aria-label="Share on Instagram"
            className="w-8 h-8 rounded-full border-[1.5px] border-black bg-transparent flex items-center justify-center transition-all duration-200 hover:bg-black group"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-black transition-all duration-200 group-hover:fill-white">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </button>

          {/* X (Twitter) */}
          <button 
            onClick={() => handleShare('x')}
            aria-label="Share on X"
            className="w-8 h-8 rounded-full border-[1.5px] border-black bg-transparent flex items-center justify-center transition-all duration-200 hover:bg-black group"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-black transition-all duration-200 group-hover:fill-white">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </button>

          {/* Telegram */}
          <button 
            onClick={() => handleShare('telegram')}
            aria-label="Share on Telegram"
            className="w-8 h-8 rounded-full border-[1.5px] border-black bg-transparent flex items-center justify-center transition-all duration-200 hover:bg-black group"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-black transition-all duration-200 group-hover:fill-white">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </button>

          {/* WhatsApp */}
          <button 
            onClick={() => handleShare('whatsapp')}
            aria-label="Share on WhatsApp"
            className="w-8 h-8 rounded-full border-[1.5px] border-black bg-transparent flex items-center justify-center transition-all duration-200 hover:bg-black group"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-black transition-all duration-200 group-hover:fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Copied Toast */}
      {copied && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-lg text-sm z-50 animate-fade-in-up">
          ✓ Copied! Now paste in Instagram
        </div>
      )}
    </>
  );
}
