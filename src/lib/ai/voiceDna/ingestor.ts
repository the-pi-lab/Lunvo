export function normalizePostText(rawText: string): string {
  if (!rawText) return "";
  
  return rawText
    // Remove invisible zero-width characters often found in pasted text
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Normalize newlines (some OS use \r\n, we just want \n)
    .replace(/\r\n/g, '\n')
    // Reduce multiple consecutive newlines to max of 2 (preserves paragraph breaks)
    .replace(/\n{3,}/g, '\n\n')
    // Remove trailing/leading spaces on each line
    .split('\n').map(line => line.trim()).join('\n')
    // Final trim for entire block
    .trim();
}

/**
 * Validates if a post is long enough to extract meaningful Voice DNA.
 * Too short posts (like "Great post!") don't yield good DNA.
 */
export function isPostValidForExtraction(text: string): { valid: boolean; reason?: string } {
  const words = text.split(/\s+/).length;
  
  if (words < 20) {
    return { valid: false, reason: "Post is too short. Minimum 20 words required for DNA extraction." };
  }
  
  if (words > 1000) {
    return { valid: false, reason: "Post is too long. Maximum 1000 words allowed." };
  }
  
  return { valid: true };
}
