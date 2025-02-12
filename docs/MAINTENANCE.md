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
- [AI Integration](#ai-integration)

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
- **AI**: Google's Gemini AI API



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

## AI Integration

### Overview
The AI system uses Google's Gemini API for CV analysis and optimization. The integration is designed to be scalable and maintainable.

### Key Components

#### 1. Gemini Service (`src/services/ai/geminiService.ts`)
- Handles all AI-related operations
- Uses Gemini 2.0 Flash model for fast response times
- Implements strict type checking for responses
- Includes comprehensive error handling

#### 2. Configuration
```typescript
// Environment Variables Required:
VITE_GEMINI_API_KEY=your_gemini_api_key
```

#### 3. Response Structure
```typescript
interface AIAnalysisResponse {
  overallScore: number;
  categories: {
    name: string;
    score: number;
    description: string;
  }[];
  improvements: {
    section: string;
    score: number;
    impact: "high" | "medium" | "low";
    context: string;
    suggestions: string[];
    optimizedContent?: string;
  }[];
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


### System Prompts
The system uses a carefully crafted prompt structure to ensure consistent and high-quality responses:

1. **Base Prompt**: Defines the AI's role and response format
2. **Analysis Guidelines**: Specifies sections to analyze
3. **Output Requirements**: Enforces British English and apprenticeship focus

### Error Handling
The system implements multiple layers of error handling:
1. API-level errors (connection, rate limits)
2. Response parsing errors
3. Content validation errors

### Maintenance Tasks

#### Regular Maintenance
1. Monitor API usage and costs
2. Review and update system prompts
3. Check error logs for patterns
4. Update test cases for new features

#### Performance Optimisation
1. Cache frequently requested analyses
2. Implement request throttling
3. Monitor response times
4. Optimize prompt length

#### Quality Assurance
1. Regular testing of AI responses
2. Validation of optimized content
3. User feedback analysis
4. A/B testing of prompts

### Troubleshooting Guide

#### Common Issues

1. **Invalid API Responses**
   - Check API key validity
   - Verify prompt format
   - Review rate limits

2. **Poor Quality Responses**
   - Review and update system prompts
   - Check input validation
   - Analyze user feedback

3. **Performance Issues**
   - Monitor API response times
   - Check request queue
   - Verify caching system

#### Debugging Steps

1. Enable debug logging:
```typescript
const DEBUG = process.env.NODE_ENV === 'development';
if (DEBUG) console.log('AI Request:', prompt);
```

2. Test API connection:
```typescript
async function testConnection() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    await model.generateContent("test");
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}
```

### Scaling Considerations

1. **Rate Limiting**
   - Implement token bucket algorithm
   - Monitor API quotas
   - Set up alerts for quota usage

2. **Cost Management**
   - Track usage per user
   - Implement usage limits
   - Monitor token consumption

3. **Performance**
   - Cache common requests
   - Implement request batching
   - Use streaming for long responses

### Testing

1. **Unit Tests**
   - Test response parsing
   - Validate error handling
   - Check input sanitization

2. **Integration Tests**
   - Test API connectivity
   - Verify response formats
   - Check error scenarios

3. **End-to-End Tests**
   - Test complete user flows
   - Verify UI updates
   - Check error displays

