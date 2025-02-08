# ApprenticeWatch Maintenance Guide

## Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Database](#database)
- [Design System](#design-system)
- [Component Guidelines](#component-guidelines)
- [State Management](#state-management)
- [Deployment](#deployment)
- [Testing](#testing)

## Project Overview

ApprenticeWatch is a platform designed to help users discover apprenticeship opportunities across the UK. The platform aggregates apprenticeship listings from various sources and provides a unified interface for searching and filtering opportunities.

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Authentication**: Supabase Auth (Google OAuth)
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Firebase Hosting
- **Analytics**: Google Analytics 4

## Project Structure

```
src/
├── components/        # Reusable UI components
├── config/           # Configuration files
├── hooks/            # Custom React hooks
├── pages/            # Page components
├── services/         # API and service integrations
├── supabase/         # Supabase-specific services
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Authentication

Authentication is handled through Supabase Auth with Google OAuth integration.

### Key Files:
- `src/services/auth/googleAuth.ts`: Main authentication service
- `src/components/auth/AuthCallback.tsx`: OAuth callback handler
- `src/components/auth/GoogleSignIn.tsx`: Sign-in component

### Authentication Flow:
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth
3. After successful auth, redirected to `/auth/callback`
4. User profile saved to Supabase and local storage
5. Redirected to main application

### User Profile Structure:
```typescript
interface SupabaseUserProfile {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  created_at?: string;
  last_login?: string;
  last_logout?: string;
}
```

## Database

We use Supabase as our database with the following key tables:

### Vacancies Table
```sql
CREATE TABLE vacancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  employer_name TEXT NOT NULL,
  posted_date TIMESTAMP WITH TIME ZONE NOT NULL,
  closing_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  -- ... other fields
);
```

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE,
  last_logout TIMESTAMP WITH TIME ZONE
);
```

## Design System

### Colors
```typescript
const colors = {
  orange: {
    50: '#fff7ed',   // Background
    100: '#ffedd5',  // Light accent
    500: '#f97316',  // Primary buttons
    600: '#ea580c',  // Hover state
    900: '#7c2d12'   // Dark text
  }
}
```

### Typography
- Primary Font: System default sans-serif
- Accent Font: 'Playfair Display' (for italics and special text)

### Component Base Classes
```typescript
const baseClasses = {
  button: "px-4 py-2 rounded-lg transition-colors",
  input: "w-full px-4 py-2 rounded-lg border focus:ring-2",
  card: "bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
}
```

## Component Guidelines

### Basic Component Structure
```typescript
import React from 'react';
import { motion } from 'framer-motion';

interface ComponentProps {
  // Define props
}

export const Component: React.FC<ComponentProps> = ({ /* props */ }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
    >
      {/* Content */}
    </motion.div>
  );
};
```

### Animation Standards
```typescript
const animations = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}
```

## State Management

- Use React hooks for component-level state
- Use Supabase realtime subscriptions for real-time updates
- Custom hooks for shared logic

### Example Custom Hook
```typescript
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Auth logic
  }, []);

  return { isAuthenticated, user };
};
```

## Deployment

### Firebase Hosting
1. Build the project: `npm run build`
2. Deploy: `firebase deploy`

### Environment Variables
Required variables in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_API_KEY=your_supabase_key
VITE_GA_TRACKING_ID=your_ga_id
VITE_FIREBASE_CONFIG=your_firebase_config
```

## Testing

