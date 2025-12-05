import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'InvestedLuxury Privacy Policy - How we collect, use, and protect your information.',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 bg-cream">
        <div className="container-luxury text-center">
          <h1 className="font-serif text-display text-black mb-4">
            Privacy Policy
          </h1>
          <p className="text-body text-charcoal">
            Last updated: December 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-white">
        <div className="container-luxury">
          <div className="max-w-article mx-auto article-content">
            <p>
              At InvestedLuxury (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website investedluxury.com.
            </p>

            <h2>Information We Collect</h2>
            
            <h3>Information You Provide</h3>
            <p>
              We may collect information you voluntarily provide, including your name, email address, and any other information you choose to provide when subscribing to our newsletter, submitting a contact form, or interacting with our website.
            </p>

            <h3>Automatically Collected Information</h3>
            <p>
              When you visit our website, we may automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies installed on your device. Additionally, we may collect information about the individual web pages you view, referring websites, and how you interact with our website.
            </p>

            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Send you our newsletter and marketing communications (with your consent)</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Analyze and improve our website and content</li>
              <li>Prevent fraud and enhance security</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.
            </p>
            <p>
              You can instruct your browser to refuse all cookies or indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
            </p>

            <h2>Third-Party Services</h2>
            <p>
              We may employ third-party companies and individuals to facilitate our website, provide services on our behalf, perform website-related services, or assist us in analyzing how our website is used. These third parties have access to your personal information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>

            <h3>Analytics</h3>
            <p>
              We use Google Analytics to monitor and analyze the use of our website. Google Analytics is a web analytics service that tracks and reports website traffic. For more information on the privacy practices of Google, please visit the Google Privacy & Terms page.
            </p>

            <h3>Affiliate Links</h3>
            <p>
              Our website contains affiliate links to third-party products and services. When you click on these links and make a purchase, we may earn a commission. These third-party sites have their own privacy policies, and we have no responsibility or liability for their content or activities.
            </p>

            <h2>Data Security</h2>
            <p>
              The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
            </p>

            <h2>Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul>
              <li>The right to access the personal information we hold about you</li>
              <li>The right to request correction of inaccurate information</li>
              <li>The right to request deletion of your information</li>
              <li>The right to opt-out of marketing communications</li>
              <li>The right to data portability</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us using the information provided below.
            </p>

            <h2>Children&apos;s Privacy</h2>
            <p>
              Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us.
            </p>

            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date at the top of this Privacy Policy.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              Email: privacy@investedluxury.com
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
