import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    // If there's a session but no user_data cookie, set it
    if (session?.user && !request.cookies.get('user_data')) {
      const userData = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata.full_name || session.user.user_metadata.name || null,
        picture: session.user.user_metadata.avatar_url || null,
        last_login: new Date().toISOString(),
      };

      res.cookies.set({
        name: 'user_data',
        value: Buffer.from(JSON.stringify(userData)).toString('base64'),
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        domain: getCookieDomain(request.nextUrl.hostname)
      });
    }

    if (error) {
      console.error('Middleware auth error:', error);
    }
  } catch (error) {
    console.error('Middleware error:', error);
  }

  return res;
}

function getCookieDomain(hostname: string): string {
  if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
    return hostname;
  }

  if (hostname.includes('apprenticewatch.com')) {
    return '.apprenticewatch.com';
  }

  const parts = hostname.split('.');
  if (parts.length > 2) {
    return `.${parts.slice(-2).join('.')}`;
  }
  
  return hostname;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ]
};