/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses basic HTML escaping for server-side safety
 */

// Basic HTML entity encoding
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  // For now, just escape HTML entities to prevent XSS
  // In production, consider using DOMPurify on the client side
  return escapeHtml(dirty);
}

/**
 * Sanitize plain text (strip all HTML)
 */
export function sanitizeText(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  // Remove all HTML tags and escape remaining content
  const withoutTags = dirty.replace(/<[^>]*>/g, '');
  return escapeHtml(withoutTags).trim();
}

/**
 * Sanitize feedback content (allows basic formatting)
 */
export function sanitizeFeedback(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Basic sanitization - escape HTML
  return escapeHtml(content);
}

/**
 * Sanitize comment content (very strict - plain text with line breaks only)
 */
export function sanitizeComment(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Allow line breaks but escape everything else
  return content
    .split('\n')
    .map((line) => escapeHtml(line))
    .join('\n');
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Only allow http and https protocols
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize user input object (for forms)
 */
export function sanitizeUserInput<T extends Record<string, any>>(input: T): T {
  const sanitized = {} as T;

  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeText(value) as T[keyof T];
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key as keyof T] = sanitizeUserInput(value) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  }

  return sanitized;
}
