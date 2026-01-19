'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
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
            {status === 'success' ? (
              <div className="text-center py-12">
                <h2 className="font-serif text-2xl text-black mb-4">Thank You!</h2>
                <p className="text-charcoal">Your message has been sent. We will get back to you soon.</p>
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
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 focus:border-gold focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
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
cat > src/app/api/newsletter/route.ts << 'EOF'
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Send confirmation email to subscriber
    await resend.emails.send({
      from: 'InvestedLuxury <noreply@investedluxury.com>',
      to: email,
      subject: 'Welcome to InvestedLuxury',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a1a; font-size: 24px; font-weight: normal; margin-bottom: 20px;">
            Welcome to InvestedLuxury
          </h1>
          <p style="color: #4a4a4a; line-height: 1.6; margin-bottom: 20px;">
            Thank you for subscribing to our newsletter. You'll be the first to know about:
          </p>
          <ul style="color: #4a4a4a; line-height: 1.8; margin-bottom: 20px;">
            <li>New investment-worthy pieces we've discovered</li>
            <li>Exclusive guides and buying advice</li>
            <li>Resale market insights and trends</li>
          </ul>
          <p style="color: #4a4a4a; line-height: 1.6;">
            In the meantime, explore our latest articles at 
            <a href="https://investedluxury.com" style="color: #C9A962;">investedluxury.com</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
          <p style="color: #888; font-size: 12px;">
            You're receiving this because you subscribed at investedluxury.com.<br/>
            <a href="https://investedluxury.com/unsubscribe" style="color: #888;">Unsubscribe</a>
          </p>
        </div>
      `,
    });

    // Send notification to you
    await resend.emails.send({
      from: 'InvestedLuxury <noreply@investedluxury.com>',
      to: 'regidev.prog@gmail.com',
      subject: '📬 New Newsletter Subscriber',
      html: `
        <div style="font-family: Georgia, serif; padding: 20px;">
          <h2 style="color: #1a1a1a;">New Newsletter Subscription</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
