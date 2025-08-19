/**
 * Get the correct API base URL for both client and server components
 */
export function getApiUrl() {
  // For client-side requests, use relative URLs
  if (typeof window !== 'undefined') {
    return '';
  }
  
  // For server-side requests in production (Vercel)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // For server-side requests in development
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}