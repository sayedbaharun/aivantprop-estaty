/**
 * Get the correct API base URL for both client and server components
 */
export function getApiUrl() {
  // For client-side requests, use relative URLs
  if (typeof window !== 'undefined') {
    return '';
  }
  
  // In production, try multiple options
  if (process.env.NODE_ENV === 'production') {
    // 1. Try VERCEL_PROJECT_PRODUCTION_URL (custom domain)
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }
    
    // 2. Try VERCEL_URL (deployment URL)
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    
    // 3. Hardcode the production URL as fallback
    return 'https://www.offplandub.ai';
  }
  
  // For development
  return 'http://localhost:3000';
}