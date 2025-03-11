'use client';

import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import * as Icons from 'lucide-react';

// Create a mapping of kebab-case icon names to their components
const iconMap = {
  'check': Icons.Check,
  'x': Icons.X,
  'arrow-right': Icons.ArrowRight,
  'arrow-left': Icons.ArrowLeft,
  'calendar': Icons.Calendar,
  'tag': Icons.Tag,
  'clock': Icons.Clock,
  'user': Icons.User,
  'share-2': Icons.Share2,
  'bookmark': Icons.Bookmark,
  'search': Icons.Search,
  'chevron-right': Icons.ChevronRight,
  'chevron-left': Icons.ChevronLeft,
  'map-pin': Icons.MapPin,
  'building-2': Icons.Building2,
  'graduation-cap': Icons.GraduationCap,
  'pound-sterling': Icons.PoundSterling,
  'github': Icons.Github,
  'linkedin': Icons.Linkedin,
  'twitter': Icons.Twitter,
  'mail': Icons.Mail,
  'list': Icons.List,
  'map': Icons.Map,
  'sun': Icons.Sun,
  'moon': Icons.Moon,
  'sparkles': Icons.Sparkles,
  'lock': Icons.Lock,
  'alert-circle': Icons.AlertCircle,
  'zap': Icons.Zap,
  'bot': Icons.Bot,
  'cpu': Icons.Cpu,
  'target': Icons.Target,
  'trending-up': Icons.TrendingUp,
  'file-text': Icons.FileText,
  'key': Icons.Key,
  'copy': Icons.Copy,
  'home': Icons.Home,
  'refresh-cw': Icons.RefreshCw,
  'award': Icons.Award,
  'users': Icons.Users,
  'briefcase': Icons.Briefcase,
  'log-out': Icons.LogOut,
  'star': Icons.Star,
};

// This component will be used to render Lucide icons in markdown content
export function LucideIconRenderer() {
  useEffect(() => {
    // Find all elements with the lucide-icon class
    const iconElements = document.querySelectorAll('.lucide-icon');
    
    // Store references to roots for cleanup
    const roots: Array<ReturnType<typeof createRoot>> = [];
    
    // For each icon element, render the appropriate Lucide icon
    iconElements.forEach((element) => {
      // Get the icon name from the class (e.g., lucide-check -> check)
      const iconClasses = Array.from(element.classList)
        .find(className => className.startsWith('lucide-') && className !== 'lucide-icon');
      
      if (iconClasses) {
        const iconName = iconClasses.replace('lucide-', '');
        const IconComponent = iconMap[iconName as keyof typeof iconMap];
        
        if (IconComponent) {
          // Clear the original element's content
          element.innerHTML = '';
          
          // Create a container for the icon
          const iconContainer = document.createElement('div');
          element.appendChild(iconContainer);
          
          // Use inline styles to match the parent text
          const computedStyle = window.getComputedStyle(element);
          const color = computedStyle.color;
          const fontSize = computedStyle.fontSize;
          
          // Create a React root
          const root = createRoot(iconContainer);
          roots.push(root);
          
          // Render the icon
          root.render(
            <IconComponent 
              size={parseInt(fontSize)} 
              color={color}
              style={{ 
                display: 'inline-block',
                verticalAlign: 'middle',
                marginBottom: '0.125em' // Slight adjustment to align with text
              }}
            />
          );
        }
      }
    });
    
    // Cleanup function
    return () => {
      roots.forEach(root => {
        root.unmount();
      });
    };
  }, []);
  
  // This component doesn't render anything itself
  return null;
}
