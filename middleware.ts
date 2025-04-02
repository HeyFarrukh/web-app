import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Check for old ID-based apprenticeship URLs
  const apprenticeshipIdPattern = /^\/apprenticeships\/(\d+)$/;
  const match = request.nextUrl.pathname.match(apprenticeshipIdPattern);
  
  if (match) {
    const id = match[1];
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => request.cookies.get(name)?.value,
          set: () => {},
          remove: () => {},
        },
      }
    );

    try {
      // Query the vacancy to get its slug
      const { data: vacancy } = await supabase
        .from('vacancies')
        .select('slug')
        .eq('id', id)
        .single();

      if (vacancy?.slug) {
        // Redirect to the new slug-based URL
        const url = request.nextUrl.clone();
        url.pathname = `/apprenticeships/${vacancy.slug}`;
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('Error fetching vacancy for redirect:', error);
    }
  }

  const res = NextResponse.next();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Supabase configuration missing! Please set the required env variables.");
  }
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove: (name, options) => {
          res.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

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