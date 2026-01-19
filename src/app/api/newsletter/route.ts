import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

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
      to: 'investedlux@gmail.com',
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
