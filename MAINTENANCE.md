# ApprenticeWatch Maintenance Guide

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Database](#database)
- [Logging System](#logging-system)
- [Design System](#design-system)
- [Component Guidelines](#component-guidelines)
- [State Management](#state-management)
- [Analytics Integration](#analytics-integration)
- [Mapbox Integration](#mapbox-integration)
- [AI Integration](#ai-integration)
- [PDF Handling and Storage](#pdf-handling-and-storage)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Project Overview

ApprenticeWatch is a platform designed to help users discover apprenticeship opportunities across the UK. The platform aggregates apprenticeship listings from various sources and provides a unified interface for searching and filtering opportunities. It also offers CV optimization features powered by AI to help users improve their applications.

## Tech Stack

- **Frontend Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Authentication**: Supabase Auth (Google OAuth)
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Firebase Hosting
- **Analytics**: Google Analytics 4
- **Maps**: Mapbox
- **AI**: Google's Gemini AI API
- **Logging**: Custom structured logging system

## Project Structure

The project follows the Next.js App Router structure:

```
web-app/
├── app/                  # Next.js App Router pages and layouts
│   ├── api/              # API routes
│   ├── apprenticeships/  # Apprenticeship listing pages
│   ├── auth/             # Authentication pages
│   ├── optimise-cv/      # CV optimization pages
│   └── ...
├── components/           # Reusable React components
│   ├── auth/             # Authentication components
│   ├── listings/         # Apprenticeship listing components
│   ├── pages/            # Page-specific components
│   └── ...
├── config/               # Configuration files
├── hooks/                # Custom React hooks
├── public/               # Static assets
├── services/            # Service modules
│   ├── ai/              # AI service integration
│   ├── analytics/       # Analytics service
│   ├── auth/            # Authentication service
│   ├── logger/          # Structured logging service
│   └── supabase/        # Supabase client and utilities
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## Authentication

Authentication is handled through Supabase Auth with Google OAuth integration.

### Key Files

- `services/auth/googleAuthService.ts`: Main authentication service
- `components/auth/GoogleSignIn.tsx`: Sign-in component
- `app/auth/callback/`: OAuth callback handler

### Authentication Flow

1. User clicks "Sign in with Google" button
2. User is redirected to Google OAuth
3. After successful authentication, user is redirected to their original page
4. sign-in redirects now follow a unified pattern using:
   ```typescript
   const currentPath = window.location.pathname + window.location.search;
   router.push(`/signin?redirect=${encodeURIComponent(currentPath)}`);
   ```
5. User profile is saved to Supabase and local storage

## Logging System

The application uses a structured logging system to ensure consistent error handling, debugging, and monitoring across all services.

### Key Features

- Environment-aware logging (development vs. production)
- Multiple log levels (info, warn, error, debug)
- Structured log format with metadata
- Sensitive data protection
- Performance tracking

### Usage

1. Import and initialize the logger:

```typescript
import { createLogger } from "@/services/logger/logger";

const logger = createLogger({ module: "YourServiceName" });
```

2. Log with different levels:

```typescript
// Info level for general information
logger.info("Operation completed", {
  userId,
  operationType: "upload",
  duration: 1200,
});

// Error level for error handling
logger.error("Operation failed", {
  error: error.message,
  context: "file_upload",
  userId,
});

// Debug level for detailed information (not shown in production)
logger.debug("Processing step completed", {
  step: "validation",
  result: "success",
});

// Warn level for potential issues
logger.warn("Resource limit approaching", {
  usage: 85,
  limit: 100,
});
```

3. Handling Sensitive Data:

```typescript
// DO: Log metadata without sensitive content
logger.info("CV analysis started", {
  cvLength: cv.length,
  jobDescLength: jobDescription.length,
});

// DON'T: Log sensitive content directly
logger.info("CV analysis started", { cv, jobDescription }); // Wrong!
```

### Log Levels

- **Error**: Use for failures that need immediate attention
- **Warn**: Use for potentially problematic situations
- **Info**: Use for general operational information
- **Debug**: Use for detailed debugging information (development only)

### Best Practices

1. Always include relevant context in log messages
2. Use structured logging with metadata objects
3. Never log sensitive information (passwords, personal data, full documents)
4. Use appropriate log levels based on severity
5. Include error messages and stack traces for errors
6. Add performance metrics where relevant

## Analytics Integration

Analytics are handled through Google Analytics 4 with custom event tracking.

### Key Files

- `services/analytics/analytics.ts`: Main analytics service
- Integration with the logger for error tracking

### Event Tracking

Events are now tracked with structured data and proper error handling:

```typescript
// Track a user action
Analytics.event("cv_optimization", "start_analysis", value);

// Track page views
Analytics.pageView("/optimise-cv");

// Track timing events
Analytics.timing("cv_analysis", "processing_time", duration);
```

## Design System

### Colors

The primary color scheme is orange-based, defined in `tailwind.config.ts`:

```typescript
colors: {
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

Common component styles are applied using Tailwind utility classes:

```typescript
// Button styles
"px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors";

// Input styles
"w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent";

// Card styles
"bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6";
```

### Dark Mode

Dark mode is supported using Tailwind's `dark:` variant. The dark mode toggle is controlled by a class on the `<html>` element.

## Component Guidelines

### Basic Component Structure

```typescript
import React from "react";
import { motion } from "framer-motion";

interface ComponentProps {
  // Define props
}

export const Component: React.FC<ComponentProps> = (
  {
    /* props */
  }
) => {
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

Use Framer Motion for animations with consistent animation properties:

```typescript
const animations = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};
```

### Best Practices

1. Use TypeScript interfaces for all component props
2. Use functional components with hooks
3. Implement responsive design using Tailwind's responsive classes
4. Add dark mode support with `dark:` variants
5. Use Framer Motion for animations
6. Include proper accessibility attributes

## State Management

The application uses React's built-in state management solutions:

1. **Local Component State**: `useState` for component-specific state
2. **Context API**: For sharing state between related components
3. **Server Components**: For data fetching and rendering on the server
4. **React Query**: For complex data fetching and caching (where applicable)

### Example Custom Hook

```typescript
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading };
};
```

## Mapbox Integration

Mapbox is used to display apprenticeship locations on interactive maps.

### Key Files

- `components/listings/ListingsMap.tsx`: Main map component

### Features

1. Display apprenticeship locations on a map
2. Interactive markers with popups showing listing details
3. Automatic zoom and centering based on listing locations
4. Responsive design for different screen sizes

### Implementation Details

- Mapbox GL JS is used directly (not via a React wrapper)
- Maps are initialized with Great Britain bounds
- Markers are created dynamically based on listing data
- Popups show listing details and link to the full listing

```typescript
// Initialize map
map.current = new mapboxgl.Map({
  container: mapContainer.current,
  style: "mapbox://styles/mapbox/streets-v12",
  center: [longitude, latitude],
  zoom: zoom,
  maxBounds: [
    [gbBounds.west - 1, gbBounds.south - 1],
    [gbBounds.east + 1, gbBounds.north + 1],
  ],
});
```

## AI Integration

The application uses Google's Gemini AI API for CV optimization.

### Key Files

- `services/ai/geminiService.ts`: Main AI service
- `components/optimise-cv/OptimiseCV.tsx`: CV optimization UI component
- `services/cv/cvTrackingService.ts`: Service for tracking CV optimizations
- `app/optimise-cv/page.tsx`: CV optimization page

### Features

1. CV analysis against job descriptions
2. Structured feedback on CV content
3. Section-by-section improvement suggestions
4. Optimized content generation
5. CV optimization history tracking
6. Rate limiting to prevent abuse

### Implementation Details

- Uses Gemini 1.5 Flash model for fast response times
- Implements a structured prompt system
- Returns responses in a standardized JSON format:

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
    optimisedContent?: string;
  }[];
}
```

### CV Optimization Flow

1. User inputs their CV text and a job description
2. System validates input length and checks for rate limiting
3. CV is sent to Gemini AI for analysis against the job description
4. Analysis results are displayed with:
   - Overall score
   - Category scores (Relevance, Impact, Clarity, Keywords)
   - Section-by-section improvement suggestions
   - Optimized content for each section
5. User can copy optimized content to clipboard
6. Optimization is recorded in the database for tracking

### Database Schema

The CV optimization feature uses two main tables:

```sql
CREATE TABLE cv_optimisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  cv_text TEXT NOT NULL,
  job_description TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB,
  user_email TEXT
);

CREATE TABLE cv_optimisation_improvements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  optimisation_id UUID REFERENCES cv_optimisations(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  score INTEGER NOT NULL,
  impact TEXT NOT NULL,
  context TEXT,
  suggestions JSONB NOT NULL,
  optimised_content TEXT,
  user_email TEXT
);
```

### Error Handling

The service includes comprehensive error handling:

1. API connection errors
2. Response parsing errors
3. Invalid response format errors
4. Input validation errors
5. Rate limiting errors

### System Prompts

The system uses a carefully crafted prompt structure to ensure consistent and high-quality responses:

1. **Base Prompt**: Defines the AI's role and response format
2. **Analysis Guidelines**: Specifies sections to analyze
3. **Output Requirements**: Enforces British English and apprenticeship focus

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

## PDF Handling and Storage

### PDF Processing Architecture

The application uses PDF.js for text extraction with a hybrid approach:

1. Core Components:

   - `pdfjs-dist` npm package for core functionality and TypeScript types
   - CDN-hosted resources for supplementary files (cmaps and fonts)

2. Implementation:

```typescript
// PDF.js configuration in pdfService.ts
const loadingTask = pdfjsLib.getDocument({
  data: arrayBuffer,
  cMapUrl: "https://unpkg.com/browse/pdfjs-dist@4.10.38/cmaps/",
  cMapPacked: true,
  standardFontDataUrl:
    "https://unpkg.com/browse/pdfjs-dist@4.10.38/standard_fonts/",
});
```

3. Benefits:
   - Core functionality bundled with the app for reliability
   - Supplementary resources loaded on-demand from CDN
   - Full TypeScript support through npm package
   - Reduced bundle size by using CDN for large resources

### PDF Processing Flow

1. User uploads PDF (5MB size limit enforced)
2. File size and type validation
3. PDF.js worker initialization
4. Text extraction using PDF.js
5. Text sent to Gemini AI for analysis

### File Size Limits

- Maximum PDF file size: 5MB
- File size validation occurs before processing
- User-friendly warnings are shown via the alert system
- File size errors are tracked in analytics

### Implementation Details

```typescript
// File size validation in FileUpload component
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

if (file.size > MAX_FILE_SIZE) {
  logger.warn("File size exceeded:", {
    size: file.size,
    maxSize: MAX_FILE_SIZE,
  });
  return showAlert("error", "File too large. Maximum size is 5MB.");
}
```

### PDF Storage in Supabase

PDFs are stored securely in Supabase with the following configuration:

1. Storage Configuration

   - Bucket: 'cv-pdfs' (private bucket)
   - Access: Row Level Security (RLS) enabled
   - User association: Each PDF is linked to the uploading user

2. Database Schema

```sql
CREATE TABLE user_pdfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  email TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Email sync trigger
CREATE TRIGGER sync_user_email
  AFTER INSERT OR UPDATE ON user_pdfs
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_email();
```

3. Security Features
   - RLS policies ensure users can only access their own PDFs
   - Email column is automatically synced with auth.users
   - Efficient lookups via email index
   - Automatic timestamp management

### Logging and Monitoring

PDF operations are tracked using structured logging:

```typescript
// PDF upload logging
logger.info("Starting PDF upload", {
  fileName: file.name,
  fileSize: file.size,
  userId: user.id,
});

// PDF processing logging
logger.info("PDF text extraction complete", {
  fileName: file.name,
  textLength: extractedText.length,
  processingTime: endTime - startTime,
});
```

## Environment Variables

The application requires the following environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Analytics
NEXT_PUBLIC_GA_ID=your_ga4_measurement_id

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Google AI (Gemini)
GOOGLE_AI_API_KEY=your_gemini_api_key

# File Upload Limits
MAX_FILE_SIZE=5242880 # 5MB in bytes
```

## Deployment

The application is deployed using Firebase Hosting.

### Deployment Process

1. Build the Next.js application: `next build`
2. Deploy to Firebase: `firebase deploy`

### Deployment Scripts

The deployment scripts are defined in `package.json`:

```json
"scripts": {
  "build": "next build",
  "deploy": "next build && firebase deploy"
}
```

## Troubleshooting

### Common Issues

#### Authentication Issues

- **Issue**: User cannot sign in with Google
- **Solution**: Check Supabase authentication settings and ensure the Google OAuth credentials are correctly configured

#### Map Not Displaying

- **Issue**: Mapbox map not displaying or showing errors
- **Solution**: Verify the Mapbox token is correct and check for console errors related to map initialization

#### AI Analysis Failures

- **Issue**: CV analysis returns errors or invalid responses
- **Solution**: Check the Gemini API key and verify the prompt structure in `geminiService.ts`

### Debugging Tips

1. Check browser console for errors
2. Verify environment variables are correctly set
3. Test API endpoints using Postman or similar tools
4. Use React DevTools to inspect component state
5. Check Supabase logs for database and authentication issues

### Support Resources

- Next.js Documentation: https://nextjs.org/docs
- Supabase Documentation: https://supabase.com/docs
- Mapbox Documentation: https://docs.mapbox.com
- Google Gemini API Documentation: https://ai.google.dev/docs
