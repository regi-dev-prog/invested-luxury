import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with InvestedLuxury. We would love to hear from you.',
};

export default function ContactPage() {
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
            <form className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-charcoal mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
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
                    name="lastName"
                    className="w-full px-4 py-3 border border-gray-200 focus:border-gold focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border border-gray-200 focus:border-gold focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-charcoal mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 border border-gray-200 focus:border-gold focus:outline-none transition-colors bg-white"
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="press">Press & Media</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-charcoal mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-gold focus:outline-none transition-colors resize-none"
                  required
                />
              </div>

              <div className="text-center">
                <button type="submit" className="btn-primary">
                  Send Message
                </button>
              </div>
            </form>

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
