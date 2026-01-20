'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-cream pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h1 className="font-cormorant text-4xl text-charcoal mb-6">Thank You</h1>
          <p className="text-charcoal/70">Your message has been sent. We'll be in touch soon.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream pt-32 pb-20">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="font-cormorant text-4xl md:text-5xl text-charcoal mb-4 text-center">Contact Us</h1>
        <p className="text-charcoal/70 text-center mb-12">We'd love to hear from you</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-charcoal mb-2">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-4 py-3 border border-charcoal/20 bg-white focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-charcoal mb-2">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-4 py-3 border border-charcoal/20 bg-white focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-charcoal mb-2">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-charcoal/20 bg-white focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-charcoal mb-2">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full px-4 py-3 border border-charcoal/20 bg-white focus:border-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-charcoal mb-2">Message *</label>
            <textarea
              required
              rows={6}
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full px-4 py-3 border border-charcoal/20 bg-white focus:border-gold focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-charcoal text-white py-4 hover:bg-charcoal/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </main>
  );
}
