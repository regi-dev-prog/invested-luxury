import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.PINTEREST_APP_ID;
  const redirectUri = process.env.PINTEREST_REDIRECT_URI;
  const scope = 'boards:read,boards:write,pins:read,pins:write';
  
  const authUrl = `https://www.pinterest.com/oauth/?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri!)}&response_type=code&scope=${scope}`;
  
  return NextResponse.redirect(authUrl);
}
