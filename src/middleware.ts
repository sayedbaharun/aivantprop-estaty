import { NextRequest, NextResponse } from 'next/server';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // requests per window
const rateLimitStore = new Map<string, { count: number; timestamp: number }>();

// Security headers
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const clientIP = forwarded?.split(',')[0] ?? real ?? '127.0.0.1';
  return clientIP;
}

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientIP);

  if (!clientData) {
    rateLimitStore.set(clientIP, { count: 1, timestamp: now });
    return false;
  }

  // Reset counter if window has passed
  if (now - clientData.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(clientIP, { count: 1, timestamp: now });
    return false;
  }

  // Increment counter
  clientData.count++;

  // Check if rate limit exceeded
  if (clientData.count > RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  rateLimitStore.set(clientIP, clientData);
  return false;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now - data.timestamp > RATE_LIMIT_WINDOW) {
      rateLimitStore.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

export function middleware(request: NextRequest) {
  const clientIP = getClientIP(request);
  const { pathname } = request.nextUrl;

  // Apply rate limiting to API routes and forms
  if (pathname.startsWith('/api/') || pathname.includes('contact')) {
    if (isRateLimited(clientIP)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
            ...securityHeaders,
          },
        }
      );
    }
  }

  // Create response with security headers
  const response = NextResponse.next();

  // Apply security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add CSRF protection for forms
  if (request.method === 'POST' && pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    // In production, validate origin matches host
    if (process.env.NODE_ENV === 'production') {
      if (!origin || !host || !origin.includes(host)) {
        return new NextResponse(
          JSON.stringify({
            error: 'Forbidden',
            message: 'Invalid origin',
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              ...securityHeaders,
            },
          }
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Apply to all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
};
