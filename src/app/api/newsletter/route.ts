import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { validateSubscriberEmail } from '@/lib/validateEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

type KitStatus = 'ok' | 'partial' | 'failed';

// Adds/updates the subscriber in Kit (formerly ConvertKit) and tags them by
// signup source. Never throws — always resolves to a status so a Kit outage
// can't break the subscriber's welcome email or the owner notification.
async function addToKit(email: string): Promise<{ status: KitStatus; detail: string }> {
  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) {
    console.error('[newsletter][kit] KIT_API_KEY is not set — skipping Kit sync');
    return { status: 'failed', detail: 'KIT_API_KEY not configured' };
  }

  try {
    // 1) Create (upsert) the subscriber. Kit returns 201 for a new subscriber
    //    or 200 for an existing one; both include subscriber.id.
    const subRes = await fetch('https://api.kit.com/v4/subscribers', {
      method: 'POST',
      headers: {
        'X-Kit-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email_address: email }),
    });

    if (!subRes.ok) {
      const body = await subRes.text().catch(() => '');
      console.error(`[newsletter][kit] subscriber create failed status=${subRes.status} email=${email} body=${body}`);
      return { status: 'failed', detail: `subscriber create failed (HTTP ${subRes.status})` };
    }

    const subData = await subRes.json().catch(() => null);
    const subscriberId = subData?.subscriber?.id;
    if (!subscriberId) {
      console.error(`[newsletter][kit] subscriber create returned no id email=${email} body=${JSON.stringify(subData)}`);
      return { status: 'failed', detail: 'subscriber created but no id returned' };
    }

    // 2) Tag the subscriber by signup source. Requires the subscriber id in the
    //    path; body is an empty object.
    const tagId = process.env.KIT_TAG_SITE_FORM_ID;
    if (!tagId) {
      console.error(`[newsletter][kit] KIT_TAG_SITE_FORM_ID is not set — subscriber ${subscriberId} added but not tagged`);
      return { status: 'partial', detail: `added (id ${subscriberId}) but NOT tagged — KIT_TAG_SITE_FORM_ID missing` };
    }

    const tagRes = await fetch(`https://api.kit.com/v4/tags/${tagId}/subscribers/${subscriberId}`, {
      method: 'POST',
      headers: {
        'X-Kit-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!tagRes.ok) {
      const body = await tagRes.text().catch(() => '');
      console.error(`[newsletter][kit] tagging failed status=${tagRes.status} subscriber=${subscriberId} tag=${tagId} body=${body}`);
      return { status: 'partial', detail: `added (id ${subscriberId}) but tagging failed (HTTP ${tagRes.status})` };
    }

    return { status: 'ok', detail: `added (id ${subscriberId}) and tagged source:site-form` };
  } catch (err) {
    console.error(`[newsletter][kit] unexpected error syncing email=${email} to Kit:`, err);
    return { status: 'failed', detail: 'unexpected error (see logs)' };
  }
}

export async function POST(request: Request) {
  try {
    const { email, turnstileToken } = await request.json();

    // Verify Turnstile token
    if (turnstileToken) {
      const verifyResponse = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: process.env.TURNSTILE_SECRET_KEY || '',
            response: turnstileToken,
          }),
        }
      );
      const verifyResult = await verifyResponse.json();
      
      if (!verifyResult.success) {
        return NextResponse.json(
          { error: 'Bot verification failed' },
          { status: 400 }
        );
      }
    }

    // Reject bot / disposable / malformed addresses before they ever reach Kit.
    // Runs after Turnstile, before the Kit sync. Conservative by design — see
    // src/lib/validateEmail.ts.
    const validation = validateSubscriberEmail(email);
    if (!validation.valid) {
      // Log with a searchable prefix so rejections can be reviewed/calibrated.
      console.error(
        `[newsletter][reject] email=${email} reason=${validation.reason} detail=${validation.detail ?? ''}`
      );

      // Notify the owner about every rejection so a wrongly-blocked real reader
      // is visible. Fire-and-forget: a mail failure must not change the response.
      try {
        await resend.emails.send({
          from: 'InvestedLuxury <noreply@investedluxury.com>',
          to: 'investedlux@gmail.com',
          subject: '🚫 Newsletter signup rejected',
          html: `
            <div style="font-family: Georgia, serif; padding: 20px;">
              <h2 style="color: #1a1a1a;">Newsletter signup rejected</h2>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Reason:</strong> ${validation.reason}</p>
              <p><strong>Detail:</strong> ${validation.detail ?? '—'}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              <p style="color:#888;font-size:12px;">
                If this is a real reader, loosen the heuristic in
                src/lib/validateEmail.ts (weights/threshold are constants at the top).
              </p>
            </div>
          `,
        });
      } catch (notifyErr) {
        console.error('[newsletter][reject] failed to send owner notification:', notifyErr);
      }

      // Generic message — never reveal that the address was flagged as suspicious.
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Add the subscriber to Kit (ESP) and tag by source. This runs after
    // Turnstile verification and before the emails. A Kit failure must not
    // break the flow, so addToKit never throws — we capture its status and
    // surface it in the owner notification below.
    const kit = await addToKit(email);

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
          <p><strong>Kit:</strong> ${kit.status === 'ok' ? '✅' : kit.status === 'partial' ? '⚠️' : '❌'} ${kit.detail}</p>
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
