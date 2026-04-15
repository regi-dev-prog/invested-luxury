import { NextRequest, NextResponse } from 'next/server';

const IG_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
const IG_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const FB_PAGE_ID = '1123849187467952';
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

  console.log('[Webhook] Received:', JSON.stringify(article, null, 2));

  if (!article?.title) {
    return NextResponse.json({ ok: true, skipped: 'no title' });
  }

  const category = article.categories?.[0] || '';
  const hashtags = HASHTAGS[category] || DEFAULT_HASHTAGS;
  const imageUrl = article.mainImage;
  const slug = article.slug;
  const excerpt = article.excerpt || '';

  // ── Instagram Caption ──
  const captionParts = [article.title];
  if (excerpt) captionParts.push('', excerpt);
  captionParts.push('', '🔗 Read more at investedluxury.com', '(Link in bio)', '', `${hashtags} #investedluxury`);
  const igCaption = captionParts.join('\n');

  // ── Facebook Message ──
  const articleUrl = `${SITE_URL}/${slug}`;
  const fbParts = [article.title];
  if (excerpt) fbParts.push('', excerpt);
  fbParts.push('', `🔗 ${articleUrl}`, '', `${hashtags} #investedluxury`);
  const fbMessage = fbParts.join('\n');

  if (!imageUrl) {
    console.log('[Webhook] No image, skipping');
    return NextResponse.json({ ok: true, skipped: 'no image' });
  }

  const results: { ig?: string; fb?: string; igError?: unknown; fbError?: unknown } = {};

  // ── Instagram Post ──
  try {
    const igImageUrl = `${imageUrl}?w=1080&h=1350&fit=crop`;

    const containerRes = await fetch(`${GRAPH_API}/${IG_ACCOUNT_ID}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: igImageUrl, caption: igCaption, access_token: IG_TOKEN }),
    });
    const containerData = await containerRes.json();

    if (!containerData.error) {
      await new Promise((resolve) => setTimeout(resolve, 10000));

      const publishRes = await fetch(`${GRAPH_API}/${IG_ACCOUNT_ID}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: containerData.id, access_token: IG_TOKEN }),
      });
      const publishData = await publishRes.json();
      console.log('[Webhook] IG Published:', publishData.id);
      results.ig = publishData.id;
    } else {
      console.log('[Webhook] IG Error:', containerData.error);
      results.igError = containerData.error;
    }
  } catch (err) {
    console.error('[Webhook] IG Error:', err);
    results.igError = 'Internal error';
  }

  // ── Facebook Post ──
  try {
    const fbRes = await fetch(`${GRAPH_API}/${FB_PAGE_ID}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: imageUrl, message: fbMessage, access_token: IG_TOKEN }),
    });
    const fbData = await fbRes.json();
    console.log('[Webhook] FB Published:', fbData.id || fbData.post_id);
    results.fb = fbData.id || fbData.post_id;
    if (fbData.error) {
      console.log('[Webhook] FB Error:', fbData.error);
      results.fbError = fbData.error;
    }
  } catch (err) {
    console.error('[Webhook] FB Error:', err);
    results.fbError = 'Internal error';
  }

  return NextResponse.json({ ok: true, ...results });
}