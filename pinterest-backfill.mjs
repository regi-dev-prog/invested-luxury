// ── Config ──────────────────────────────────────────────
const SANITY_PROJECT_ID = '4b3ap7pf';
const SANITY_DATASET = 'production';
const PINTEREST_TOKEN = process.env.PINTEREST_ACCESS_TOKEN;
const SITE_URL = 'https://www.investedluxury.com';
const DELAY_MS = 4 * 60 * 60 * 1000; // 4 hours

const BOARD_MAP = {
  'Bags':        '1085297278892981622',
  'Watches':     '1085297278892981632',
  'Shoes':       '1085297278892981626',
  'Jewelry':     '1085297278892981628',
  'Sneakers':    '1085297278892981623',
  'Travel':      '1085297278892981630',
  'Hotels':      '1085297278892981630',
  'Art':         '1085297278892983433',
  'Wellness':    '1085297278892981617',
  'Fashion':     '1085297278892986966',
};
const DEFAULT_BOARD = '1085297278892986966';

// ── Helpers ─────────────────────────────────────────────
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function publishToPinterest(article, index, total) {
  const imageUrl = article.mainImage?.asset?.url;
  if (!imageUrl) {
    console.log(`[${index + 1}/${total}] ⏭ Skipping "${article.title}" — no image`);
    return false;
  }

  const category = article.categories?.[0] || '';
  const boardId = BOARD_MAP[category] || DEFAULT_BOARD;
  const slug = article.slug?.current || '';

  console.log(`[${index + 1}/${total}] 📌 Publishing "${article.title}" to board ${category || 'Fashion'}...`);

  const res = await fetch('https://api.pinterest.com/v5/pins', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PINTEREST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      board_id: boardId,
      title: article.title,
      description: article.excerpt || article.title,
      link: `${SITE_URL}/${slug}`,
      media_source: {
        source_type: 'image_url',
        url: `${imageUrl}?w=1000&h=1500&fit=crop`,
      },
    }),
  });

  const data = await res.json();

  if (data.id) {
    console.log(`[${index + 1}/${total}] ✅ Published! Pin ID: ${data.id}`);
    return true;
  } else {
    console.log(`[${index + 1}/${total}] ❌ Error:`, data.message || JSON.stringify(data));
    return false;
  }
}

// ── Main ────────────────────────────────────────────────
async function main() {
  if (!PINTEREST_TOKEN) {
    console.error('Missing PINTEREST_ACCESS_TOKEN env var');
    process.exit(1);
  }

  const query = encodeURIComponent(
    `*[_type == "article"] | order(publishedAt asc) { title, excerpt, slug, categories, mainImage{asset->{url}} }`
  );
  const sanityUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-10-04/data/query/${SANITY_DATASET}?query=${query}`;

  console.log('📡 Fetching articles from Sanity...');
  const res = await fetch(sanityUrl);
  const data = await res.json();
  const articles = data.result || [];

  console.log(`Found ${articles.length} articles. Publishing one every 4 hours.`);
  console.log(`Estimated completion: ~${Math.ceil(articles.length * 4 / 24)} days\n`);

  for (let i = 0; i < articles.length; i++) {
    await publishToPinterest(articles[i], i, articles.length);

    if (i < articles.length - 1) {
      const nextTime = new Date(Date.now() + DELAY_MS).toLocaleTimeString();
      console.log(`⏳ Next pin at ${nextTime} (4 hours)\n`);
      await sleep(DELAY_MS);
    }
  }

  console.log('\n🎉 Done! All articles pinned.');
}

main().catch(console.error);
