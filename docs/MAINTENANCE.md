# ApprenticeWatch Maintenance Guide

## Table of Contents
- [Design System](#design-system)
- [Creating New Pages](#creating-new-pages)
- [Component Guidelines](#component-guidelines)
- [Styling Guidelines](#styling-guidelines)
- [State Management](#state-management)

## Design System

### Colors
```typescript
// Primary Colors
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
- Import font in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital@0;1&display=swap" rel="stylesheet">
```

### Text Sizes
```typescript
const textSizes = {
  h1: 'text-4xl sm:text-5xl md:text-6xl',
  h2: 'text-3xl font-bold',
  body: 'text-lg',
  small: 'text-sm'
}
```

## Creating New Pages

1. Create new page in `src/pages/`:
```typescript
import React from 'react';
import { motion } from 'framer-motion';

export const NewPage = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
        >
          Page Title
        </motion.h1>
        {/* Content */}
      </div>
    </div>
  );
};
```

2. Add route in `App.tsx`:
```typescript
<Route path="/new-page" element={<NewPage />} />
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
- Use Framer Motion for animations
- Standard animation values:
```typescript
const animations = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}
```

## Styling Guidelines

### Container Classes
```typescript
const containers = {
  page: "min-h-screen pt-24 pb-12",
  section: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  card: "bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
}
```

### Dark Mode Support
- Always include dark mode variants:
```typescript
const darkModeClasses = {
  background: "bg-white dark:bg-gray-900",
  text: "text-gray-900 dark:text-white",
  border: "border-gray-200 dark:border-gray-700"
}
```

### Responsive Design
- Use Tailwind breakpoints consistently:
```typescript
const breakpoints = {
  sm: '640px',   // Small devices
  md: '768px',   // Medium devices
  lg: '1024px',  // Large devices
  xl: '1280px'   // Extra large devices
}
```

## State Management

### Local State
- Use React hooks for component-level state
- Extract complex state logic into custom hooks

### API Integration
- Add new API endpoints in `src/services/api/`
- Define types in `src/types/`
- Create custom hooks for data fetching in `src/hooks/`

### Form Handling
- Use controlled components for forms
- Implement proper validation
- Show loading states during submissions

## Best Practices

1. Component Organization:
   - Keep components small and focused
   - Extract reusable logic into hooks
   - Use TypeScript for type safety

2. Performance:
   - Lazy load routes
   - Optimize images
   - Memoize expensive calculations

3. Accessibility:
   - Use semantic HTML
   - Include proper ARIA labels
   - Ensure keyboard navigation works

4. Testing:
   - Write unit tests for utilities
   - Test components in isolation
   - Include integration tests for pages

## Common Patterns

### Loading States
```typescript
{isLoading ? (
  <motion.div className="animate-pulse">
    {/* Loading skeleton */}
  </motion.div>
) : (
  {/* Content */}
)}
```

### Error Handling
```typescript
{error ? (
  <div className="text-red-500 dark:text-red-400">
    {error.message}
  </div>
) : (
  {/* Content */}
)}
```

### Form Submission
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    await submitData();
    // Success handling
  } catch (error) {
    // Error handling
  } finally {
    setLoading(false);
  }
};
```