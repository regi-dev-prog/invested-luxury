import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  console.log('FULL BODY:', JSON.stringify(body, null, 2));
  
  return NextResponse.json({ ok: true });
}
