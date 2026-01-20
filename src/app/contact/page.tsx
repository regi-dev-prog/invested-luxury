'use client';

import { useState } from 'react';
import Turnstile from '@/components/Turnstile';

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!turnstileToken) {
      setError('Please complete the verification');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, turnstileToken }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        setError('Failed to send message. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="py-20 bg-cream">
        <div className="container-luxury text-center">
          <p className="category-badge mb-4">Contact</p>
          <h1 className="font-serif text-display text-black mb-6">
            Get in Touch
          </h1>
          <p className="text-body-lg text-charcoal max-w-xl mx-auto">
            Have a question, suggestion, or partnership inquiry? We would love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-white">
        <div className="container-luxury">
          <div className="max-w-2xl mx-auto">
            {isSubmitted ? (
              <div className="text-center py-12">
                <p className="text-charcoal font-serif text-xl mb-2">
                  Thank you for reaching out.
                </p>
                <p className="text-charcoal/70">
                  We'll be in touch soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-charcoal mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 focus:border-gold focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-charcoal mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 focus:border-gold focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 focus:border-gold focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-charcoal mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 focus:border-gold focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-charcoal mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 focus:border-gold focus:outline-none transition-colors resize-none"
                    required
                  />
                </div>

                <Turnstile 
                  onVerify={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setError('Verification failed. Please refresh and try again.')}
                />

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting || !turnstileToken}
                    className="px-12 py-4 bg-charcoal text-white font-medium tracking-wider uppercase hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-16 pt-16 border-t border-gray-100">
              <div className="grid sm:grid-cols-2 gap-8 text-center">
                <div>
                  <h3 className="font-serif text-title text-black mb-2">Email</h3>
                  <a 
                    href="mailto:hello@investedluxury.com" 
                    className="text-charcoal hover:text-gold transition-colors"
                  >
                    hello@investedluxury.com
                  </a>
                </div>
                <div>
                  <h3 className="font-serif text-title text-black mb-2">Follow Us</h3>
                  <div className="flex justify-center gap-4">
                    <a 
                      href="https://pinterest.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-charcoal hover:text-gold transition-colors"
                    >
                      Pinterest
                    </a>
                    <span className="text-gray-300">|</span>
                    <a 
                      href="https://instagram.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-charcoal hover:text-gold transition-colors"
                    >
                      Instagram
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
