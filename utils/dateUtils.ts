const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export const formatDate = (date: Date | string | number | null): string => {
  if (!date) return 'N/A';

  try {
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