
// ── Config ──────────────────────────────────────────────
const SANITY_PROJECT_ID = '4b3ap7pf';
const SANITY_DATASET = 'production';
const IG_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
const IG_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const GRAPH_API = 'https://graph.facebook.com/v21.0';
const DELAY_MS = 4 * 60 * 60 * 1000; // 4 hours

const HASHTAGS = {
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

// ── Helpers ─────────────────────────────────────────────
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildCaption(article) {
  const category = article.categories?.[0] || '';
  const hashtags = HASHTAGS[category] || DEFAULT_HASHTAGS;
  const excerpt = article.excerpt || '';

  const parts = [article.title];
  if (excerpt) parts.push('', excerpt);
  parts.push(
    '',
    '🔗 Read more at investedluxury.com',
    '(Link in bio)',
    '',
    `${hashtags} #investedluxury`
  );
  return parts.join('\n');
}

async function publishToInstagram(article, index, total) {
  const imageUrl = article.mainImage?.asset?.url;
  if (!imageUrl) {
    console.log(`[${index + 1}/${total}] ⏭ Skipping "${article.title}" — no image`);
    return false;
  }

  const igImageUrl = `${imageUrl}?w=1080&h=1350&fit=crop`;
  const caption = buildCaption(article);

  console.log(`[${index + 1}/${total}] 📸 Publishing "${article.title}"...`);

  // Step 1: Create container
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

  if (containerData.error) {
    console.log(`[${index + 1}/${total}] ❌ Container error:`, containerData.error.message);
    return false;
  }

  // Step 2: Wait for processing
  await sleep(15000);

  // Step 3: Publish
  const publishRes = await fetch(`${GRAPH_API}/${IG_ACCOUNT_ID}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: containerData.id,
      access_token: IG_TOKEN,
    }),
  });
  const publishData = await publishRes.json();

  if (publishData.error) {
    console.log(`[${index + 1}/${total}] ❌ Publish error:`, publishData.error.message);
    return false;
  }

  console.log(`[${index + 1}/${total}] ✅ Published! ID: ${publishData.id}`);
  return true;
}

// ── Main ────────────────────────────────────────────────
async function main() {
  if (!IG_ACCOUNT_ID || !IG_TOKEN) {
    console.error('Missing INSTAGRAM_BUSINESS_ACCOUNT_ID or INSTAGRAM_ACCESS_TOKEN env vars');
    process.exit(1);
  }

  // Fetch all articles from Sanity (oldest first)
  const query = encodeURIComponent(
    `*[_type == "article"] | order(publishedAt asc) { title, excerpt, slug, categories, mainImage{asset->{url}} }`
  );
  const sanityUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-10-04/data/query/${SANITY_DATASET}?query=${query}`;

  console.log('📡 Fetching articles from Sanity...');
  const res = await fetch(sanityUrl);
  const data = await res.json();
  const articles = data.result || [];

  console.log(`Found ${articles.length} articles. Publishing one every 4 hours.\n`);
  console.log(`Estimated completion: ~${Math.ceil(articles.length * 4 / 24)} days\n`);

  for (let i = 0; i < articles.length; i++) {
    const success = await publishToInstagram(articles[i], i, articles.length);

    if (i < articles.length - 1) {
      const nextTime = new Date(Date.now() + DELAY_MS).toLocaleTimeString();
      console.log(`⏳ Next post at ${nextTime} (4 hours)\n`);
      await sleep(DELAY_MS);
    }
  }

  console.log('\n🎉 Done! All articles published.');
}

main().catch(console.error);
