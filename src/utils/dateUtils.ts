// Import the Firestore Timestamp type
import { Timestamp } from 'firebase/firestore';

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export const formatDate = (date: Date | string | number | Timestamp | null): string => {
  if (!date) return 'N/A';

  try {
    // Handle Firestore Timestamp
    if (date instanceof Timestamp) {
      return dateFormatter.format(new Date(date.seconds * 1000));
    }

    // Convert other types to Date
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      console.warn('Invalid date provided:', date);
      return 'N/A';
    }

    return dateFormatter.format(d);
  } catch (error) {
    console.error('Error formatting date:', error, { date });
    return 'N/A';
  }
};
