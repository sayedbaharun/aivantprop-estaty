# Vercel Environment Variables Setup

## Required Environment Variables for Production

Add these to your Vercel project settings at:
https://vercel.com/[your-team]/aivantprop-shadcn/settings/environment-variables

### Database Configuration (REQUIRED)
```
DATABASE_URL="postgresql://postgres.qrhghekvxzjyagjmuniz:AivantEverything2025%40@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.qrhghekvxzjyagjmuniz:AivantEverything2025%40@aws-0-eu-north-1.pooler.supabase.com:5432/postgres"
```

### Site Configuration (REQUIRED)
```
NEXT_PUBLIC_SITE_URL="https://aivantprop-shadcn.vercel.app"
```

### Optional - Estaty API (if you have credentials)
```
ESTATY_BASE_URL="your-estaty-api-url"
ESTATY_API_KEY="your-estaty-api-key"
```

## How to Add Variables in Vercel:

1. Go to your Vercel dashboard
2. Select your project "aivantprop-shadcn"
3. Go to Settings → Environment Variables
4. Add each variable:
   - Key: DATABASE_URL
   - Value: (paste the connection string)
   - Environment: ✓ Production, ✓ Preview, ✓ Development
5. Click "Save"
6. Repeat for DIRECT_URL and NEXT_PUBLIC_SITE_URL
7. Redeploy your application

## Verify Setup:
After adding variables and redeploying, check:
- https://aivantprop-shadcn.vercel.app/api/properties
- https://aivantprop-shadcn.vercel.app/properties

The error should be resolved once environment variables are configured.