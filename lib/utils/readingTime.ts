/**
 * Calculates the estimated reading time for the input text.
 *
 * This function first cleans the provided text by removing markdown syntax and special characters, normalizing excessive whitespace, and trimming the result. It then counts the words and computes the estimated reading time based on an average speed of 200 words per minute. The returned string is formatted as "1 min" for a single minute or as "{n} min" for multiple minutes.
 *
 * @param content - The text content to analyze.
 * @returns A formatted string representing the estimated reading time in minutes.
 */
export function calculateReadingTime(content: string): string {
  // Remove markdown syntax and special characters
  const cleanText = content
    .replace(/[#*`_\[\]()]/g, '') // Remove markdown syntax
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Count words (split by whitespace)
  const wordCount = cleanText.split(/\s+/).length;

  // Calculate minutes (assuming 200 words per minute reading speed)
  const minutes = Math.ceil(wordCount / 200);

  // Format the output
  return minutes === 1 ? '1 min' : `${minutes} min`;
}
