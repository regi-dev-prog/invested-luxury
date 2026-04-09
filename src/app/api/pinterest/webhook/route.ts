import { NextRequest, NextResponse } from 'next/server';

const BOARD_MAP: Record<string, string> = {
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

export async function POST(request: NextRequest) {
  const body = await request.json();
  const article = body.result;
  
  console.log('Webhook received:', JSON.stringify(article, null, 2));
  
  if (!article?.title) {
    return NextResponse.json({ ok: true });
  }

  const category = article.categories?.[0] || '';
  const boardId = BOARD_MAP[category] || DEFAULT_BOARD;
  const siteUrl = 'https://www.investedluxury.com';
  const imageUrl = article.mainImage?.asset?.url;

  const pin = await fetch('https://api.pinterest.com/v5/pins', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PINTEREST_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      board_id: boardId,
      title: article.title,
      description: article.excerpt || article.title,
      link: `${siteUrl}/${article.slug?.current}`,
      media_source: {
        source_type: 'image_url',
        url: imageUrl || `${siteUrl}/og-image.jpg`,
      },
    }),
  });

  const pinData = await pin.json();
  console.log('Pinterest response:', JSON.stringify(pinData, null, 2));
  
  return NextResponse.json({ ok: true, pin: pinData });
}
