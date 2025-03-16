# Supabase Migration Guide

This document outlines the migration steps taken to update the Supabase integration in the Apprentice Watch application from `@supabase/auth-helpers-nextjs` to the newer `@supabase/ssr` package.

## Overview

Supabase has deprecated the `auth-helpers-nextjs` package in favor of the new `@supabase/ssr` package, which provides better support for server-side rendering and the App Router in Next.js.

## Changes Made

### 1. Middleware Update

The middleware has been updated from using `createMiddlewareClient` to `createServerClient`:

```typescript
// Old approach
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
const supabase = createMiddlewareClient({ req: request, res });

// New approach
import { createServerClient } from '@supabase/ssr';
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
```

### 2. Client Configuration

The Supabase client configuration in `config/supabase.ts` needs to be updated:

```typescript
// Old approach
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
});

// New approach - For client-side usage
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### 3. Server Components/API Routes

For server components and API routes, use `createServerClient`:

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getServerSideProps() {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  // Use supabase client
}
```

## Row Level Security Policies

We've also updated our row-level security policies for the `saved_apprenticeships` table:

```sql
-- Enable Row Level Security
ALTER TABLE saved_apprenticeships ENABLE ROW LEVEL SECURITY;

-- Create SELECT policy
CREATE POLICY "Users can view their own saved apprenticeships"
ON saved_apprenticeships
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create INSERT policy
CREATE POLICY "Users can insert their own saved apprenticeships"
ON saved_apprenticeships
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

These policies ensure that:
1. Users can only see their own saved apprenticeships
2. Users can only add apprenticeships to their own collection
3. The security check compares the authenticated user's ID (auth.uid()) with the user_id column in the table

## Service Updates

### SavedApprenticeshipService.ts

This service needs to be checked and possibly updated to ensure compatibility with the new Supabase client:

```typescript
// If using in a client component:
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Inside the service methods, get the client like this:
const supabase = createClientComponentClient();
```

### GoogleAuthService.ts

The Google authentication service needs to be updated:

```typescript
// Old approach
import supabase from '@/config/supabase';

// New approach for client-side auth
import { createBrowserClient } from '@supabase/ssr';

// Inside the service:
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Then use as before
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    // options remain the same
  }
});
```

## Testing Changes

After making these changes, testing should include:

1. Authentication flows (login, logout, session persistence)
2. Saved apprenticeship functionality:
   - Saving an apprenticeship
   - Retrieving saved apprenticeships
   - Unsaving an apprenticeship
   - Checking if an apprenticeship is saved
3. Testing both client-side and server-side interactions with the Supabase client

## Additional Considerations

- If using server actions, ensure they're updated to use the correct client pattern
- Check for any direct imports of the deprecated packages and update them
- Update any TypeScript types that may have changed in the new packages

## Areas To Check/Update

The following services may need to be updated to ensure they're working properly with the new auth approach:

1. `savedApprenticeshipService.ts` - Uses the Supabase client for CRUD operations on saved apprenticeships
2. Authentication components like `GoogleSignIn.tsx`
3. Any components that use the Supabase auth state or session

## References

- [Supabase Auth Migration Guide](https://supabase.com/docs/guides/auth/auth-helpers/nextjs-migration-guide)
- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Supabase Authentication Documentation](https://supabase.com/docs/guides/auth)
