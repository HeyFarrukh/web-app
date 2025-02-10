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
- **AI**: Google's Gemini AI API

[Previous sections remain unchanged...]

## AI Integration

### Overview
The AI system uses Google's Gemini API for CV analysis and optimization. The integration is designed to be scalable and maintainable.

### Key Components

#### 1. Gemini Service (`src/services/ai/geminiService.ts`)
- Handles all AI-related operations
- Uses Gemini 1.5 Flash model for fast response times
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

[Rest of the document remains unchanged...]