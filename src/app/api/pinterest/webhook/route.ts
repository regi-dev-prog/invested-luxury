import { NextRequest, NextResponse } from 'next/server';

const BOARD_MAP: Record<string, string> = {
  'Bags':               '1085297278892981622',
  'Watches':            '1085297278892981632',
  'Shoes':              '1085297278892981626',
  'Jewelry':            '1085297278892981628',
  'Sneakers':           '1085297278892981623',
  'Travel':             '1085297278892981630',
  'Hotels':             '1085297278892981630',
  'Art & Photography':  '1085297278892983433',
  'Biohacking':         '1085297278892981617',
  'Longevity':          '1085297278892981617',
  'Retreats':           '1085297278892981617',
  'Shopping':           '1085297278892981626',
  'Retailers':          '1085297278892981626',
  'Investment Guides':  '1085297278892986966',
  'Beginner Guides':    '1085297278892986966',
  'Seasonal Guides':    '1085297278892986966',
  'Gift Guides':        '1085297278892986966',
};

const DEFAULT_BOARD = '1085297278892986966';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const article = body;

  if (!article?.title) {
    return NextResponse.json({ ok: true });
  }

  const category = article.categories?.[0] || '';
  const boardId = BOARD_MAP[category] || DEFAULT_BOARD;
  const siteUrl = 'https://www.investedluxury.com';
  const imageUrl = article.mainImage;

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
      link: `${siteUrl}/${article.slug}`,
      media_source: {
        source_type: 'image_url',
        url: imageUrl || `${siteUrl}/og-image.jpg`,
      },
    }),
  });

  const pinData = await pin.json();
  console.log('Pinterest response:', JSON.stringify(pinData));

  return NextResponse.json({ ok: true, pin: pinData });
}
