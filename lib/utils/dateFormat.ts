/**
 * Formats a date string into SEO-friendly ISO format.
 *
 * Converts the given date string to a Date object and returns the date in "YYYY-MM-DD" format by extracting the
 * date portion of the ISO string.
 *
 * @param dateStr - A string representing a date.
 * @returns The formatted date string in "YYYY-MM-DD" format.
 */
export function formatDateForSEO(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
}

/**
 * Formats a date string for display in a human-readable format.
 *
 * Converts the input date string into a Date object and returns it formatted as "day month year"
 * (e.g., "1 January 2023") using the 'en-GB' locale.
 *
 * @param dateStr - A date string that can be parsed by the Date constructor.
 * @returns The formatted date string.
 */
export function formatDateForDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
