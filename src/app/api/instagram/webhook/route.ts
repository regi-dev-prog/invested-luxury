import { NextRequest, NextResponse } from 'next/server';

const IG_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
const IG_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const GRAPH_API = 'https://graph.facebook.com/v21.0';
const SITE_URL = 'https://www.investedluxury.com';

const HASHTAGS: Record<string, string> = {
  'Bags': '#luxurybags #designerbags #investmentbags',
  'Watches': '#luxurywatches #watchcollector #horology',
  'Shoes': '#luxuryshoes #designershoes #shoestyle',
  'Jewelry': '#finejewelry #luxuryjewelry #jewelrydesign',
  'Sneakers': '#luxurysneakers #sneakerhead #designersneakers',
  'Travel': '#luxurytravel #travelstyle #luxurylifestyle',
  'Hotels': '#luxuryhotels #boutiquehotels #hoteldesign',
  'Art': '#contemporaryart #artcollector #luxuryart',
  'Wellness': '#luxurywellness #biohacking #longevity',
  'Fashion': '#quietluxury #luxuryfashion #designerstyle',
};

const DEFAULT_HASHTAGS = '#investedluxury #luxurylifestyle #luxuryfashion';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const article = body.result;

  console.log('[IG Webhook] Received:', JSON.stringify(article, null, 2));

  if (!article?.title) {
    return NextResponse.json({ ok: true, skipped: 'no title' });
  }

  const category = article.categories?.[0] || '';
  const hashtags = HASHTAGS[category] || DEFAULT_HASHTAGS;
  const imageUrl = article.mainImage?.asset?.url;
  const slug = article.slug?.current;
  const excerpt = article.excerpt || '';

  const captionParts = [article.title];
  if (excerpt) {
    captionParts.push('', excerpt);
  }
  captionParts.push(
    '',
    '🔗 Read more at investedluxury.com',
    '(Link in bio)',
    '',
    `${hashtags} #investedluxury`
  );
  const caption = captionParts.join('\n');

  if (!imageUrl) {
    console.log('[IG Webhook] No image, skipping');
    return NextResponse.json({ ok: true, skipped: 'no image' });
  }

  // Crop to 4:5 portrait (1080x1350) — ideal Instagram format
  const igImageUrl = `${imageUrl}?w=1080&h=1350&fit=crop`;

  try {
    // Step 1: Create media container
    const containerRes = await fetch(`${GRAPH_API}/${IG_ACCOUNT_ID}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: igImageUrl,
        caption,
        access_token: IG_TOKEN,
      }),
    });

    const containerData = await containerRes.json();
    console.log('[IG Webhook] Container:', JSON.stringify(containerData, null, 2));

    if (containerData.error) {
      return NextResponse.json({ ok: false, error: containerData.error }, { status: 400 });
    }

    // Step 2: Wait for media to be ready
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Step 3: Publish the container
    const publishRes = await fetch(`${GRAPH_API}/${IG_ACCOUNT_ID}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerData.id,
        access_token: IG_TOKEN,
      }),
    });

    const publishData = await publishRes.json();
    console.log('[IG Webhook] Published:', JSON.stringify(publishData, null, 2));

    if (publishData.error) {
      return NextResponse.json({ ok: false, error: publishData.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, ig_media_id: publishData.id });
  } catch (err) {
    console.error('[IG Webhook] Error:', err);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}