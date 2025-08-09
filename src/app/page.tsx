/**
 * Homepage - Luxury Off-Plan Property Portal
 * The most advanced off-plan property listing site in the UAE
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import { HeroSection } from '@/components/hero-section';
import { FeaturedProperties } from '@/components/featured-properties';
import { SearchFilters } from '@/components/search-filters';
import { DeveloperShowcase } from '@/components/developer-showcase';
import { NewsAndInsights } from '@/components/news-insights';
import { StatsSection } from '@/components/stats-section';
import { CTASection } from '@/components/cta-section';
import { LuxuryShowcaseSection } from '@/components/luxury-showcase-section';

export const metadata: Metadata = {
  title: 'Off Plan Dub.ai | Live the Art of Luxury - UAE&apos;s Premier Off-Plan Platform',
  description: 'Discover breathtaking villas, timeless interiors, and stunning exteriors in Dubai&apos;s most exclusive off-plan developments. UAE&apos;s premier luxury property platform.',
  keywords: [
    'off-plan properties UAE',
    'Dubai real estate',
    'luxury properties',
    'pre-launch properties',
    'property investment UAE',
    'Dubai off-plan',
    'Abu Dhabi properties'
  ].join(', '),
  openGraph: {
    title: 'Off Plan Dub.ai | Live the Art of Luxury - UAE\'s Premier Off-Plan Platform',
    description: 'Discover breathtaking villas, timeless interiors, and stunning exteriors in Dubai\'s most exclusive off-plan developments.',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'Off Plan Dub.ai',
    images: [
      {
        url: '/images/og-homepage.jpg',
        width: 1200,
        height: 630,
        alt: 'Off Plan Dub.ai - Live the Art of Luxury',
      },
    ],
    locale: 'en_AE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Off Plan Dub.ai | Live the Art of Luxury',
    description: 'Discover breathtaking villas, timeless interiors, and stunning exteriors in Dubai\'s most exclusive off-plan developments.',
    images: ['/images/og-homepage.jpg'],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section with Advanced Search */}
      <HeroSection />
      
      {/* Stats Section */}
      <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse" />}>
        <StatsSection />
      </Suspense>
      
      {/* Featured Properties */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Featured Off-Plan Properties
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover handpicked luxury developments from Dubai's most prestigious developers
            </p>
          </div>
          
          <Suspense fallback={<FeaturedPropertiesSkeleton />}>
            <FeaturedProperties />
          </Suspense>
        </div>
      </section>
      
      {/* Luxury Showcase Section - Dubai Face Inspired */}
      <LuxuryShowcaseSection />
      
      {/* Advanced Search Filters */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Advanced Property Search
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find your perfect property with 20+ filters and real-time results
            </p>
          </div>
          
          <Suspense fallback={<SearchFiltersSkeleton />}>
            <SearchFilters />
          </Suspense>
        </div>
      </section>
      
      {/* Developer Showcase */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Premium Developers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore projects from UAE's most trusted and innovative property developers
            </p>
          </div>
          
          <Suspense fallback={<DeveloperShowcaseSkeleton />}>
            <DeveloperShowcase />
          </Suspense>
        </div>
      </section>
      
      {/* Market Insights & News */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Market Insights & News
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stay informed with the latest market trends and investment opportunities
            </p>
          </div>
          
          <Suspense fallback={<NewsInsightsSkeleton />}>
            <NewsAndInsights />
          </Suspense>
        </div>
      </section>
      
      {/* Call to Action */}
      <CTASection />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateBusiness",
            "name": "Aivant Properties",
            "description": "The most advanced off-plan property listing site in the UAE",
            "url": process.env.NEXT_PUBLIC_SITE_URL,
            "logo": `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`,
            "image": `${process.env.NEXT_PUBLIC_SITE_URL}/images/og-homepage.jpg`,
            "telephone": "+971-XX-XXXXXX",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Business Bay",
              "addressLocality": "Dubai",
              "addressCountry": "AE"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "25.2048",
              "longitude": "55.2708"
            },
            "sameAs": [
              "https://www.facebook.com/aivantproperties",
              "https://www.instagram.com/aivantproperties",
              "https://www.linkedin.com/company/aivantproperties"
            ],
            "serviceArea": {
              "@type": "Country",
              "name": "United Arab Emirates"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Off-Plan Properties",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Luxury Apartments",
                    "category": "Real Estate"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Premium Villas",
                    "category": "Real Estate"
                  }
                }
              ]
            }
          }),
        }}
      />
    </main>
  );
}

// Loading skeletons
function FeaturedPropertiesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
          <div className="h-64 bg-gray-300" />
          <div className="p-6">
            <div className="h-4 bg-gray-300 rounded mb-2" />
            <div className="h-6 bg-gray-300 rounded mb-4" />
            <div className="flex justify-between">
              <div className="h-4 bg-gray-300 rounded w-24" />
              <div className="h-4 bg-gray-300 rounded w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchFiltersSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-gray-300 rounded mb-2" />
            <div className="h-10 bg-gray-300 rounded" />
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-8">
        <div className="h-12 bg-gray-300 rounded-lg w-32" />
      </div>
    </div>
  );
}

function DeveloperShowcaseSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
          <div className="h-16 bg-gray-300 rounded mb-4" />
          <div className="h-4 bg-gray-300 rounded" />
        </div>
      ))}
    </div>
  );
}

function NewsInsightsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-300" />
          <div className="p-6">
            <div className="h-4 bg-gray-300 rounded mb-2" />
            <div className="h-6 bg-gray-300 rounded mb-4" />
            <div className="h-20 bg-gray-300 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}