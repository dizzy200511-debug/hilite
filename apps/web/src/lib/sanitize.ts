import DOMPurify from 'dompurify';

/** Plain text in, plain text out: strips control characters and caps length. */
export function cleanText(input: unknown, max = 2000): string {
  return String(input ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .slice(0, max)
    .trim();
}

/** For the few places that render rich text (notes): only safe tags survive. */
export function safeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 'br', 'p', 'ul', 'ol', 'li', 'h3', 'h4', 'code', 'mark'],
    ALLOWED_ATTR: [],
  });
}

/** Only http(s) links are ever opened; blocks javascript: and data: URLs. */
export function safeUrl(url: string): string | null {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null;
  } catch {
    return null;
  }
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
