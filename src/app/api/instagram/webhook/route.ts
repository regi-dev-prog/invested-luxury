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
  const article = body.result || body;

  if (!article?.title) {
    return NextResponse.json({ ok: true, skipped: 'no title' });
  }

  const category = article.categories?.[0] || '';
  const hashtags = HASHTAGS[category] || DEFAULT_HASHTAGS;
  const imageUrl = article.mainImage;
  const excerpt = article.excerpt || '';

  // URL מלא עם category path
  const articleUrl = article.parentCategory && article.categorySlug
    ? `${SITE_URL}/${article.parentCategory}/${article.categorySlug}/${article.slug}`
    : `${SITE_URL}/${article.slug}`;

  // ── Instagram Caption ──
  const igCaption = [
    article.title,
    '',
    excerpt,
    '',
    '🔗 Read more at investedluxury.com',
    '(Link in bio)',
    '',
    `${hashtags} #investedluxury`
  ].join('\n');

  // ── Facebook Message ──
  const fbMessage = [
    article.title,
    '',
    excerpt,
    '',
    `🔗 ${articleUrl}`,
    '',
    `${hashtags} #investedluxury`
  ].join('\n');

  if (!imageUrl) {
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
      results.ig = publishData.id;
    } else {
      results.igError = containerData.error;
    }
  } catch (err) {
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
    results.fb = fbData.id || fbData.post_id;
    if (fbData.error) results.fbError = fbData.error;
  } catch (err) {
    results.fbError = 'Internal error';
  }

  return NextResponse.json({ ok: true, ...results });
}
