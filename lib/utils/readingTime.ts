/**
 * Calculate reading time in minutes for a given text content
 * Average reading speed is assumed to be 200 words per minute
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
