'use client';

import Script from 'next/script';

export function GoogleAnalytics() {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  );
}

// Custom event tracking functions
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const trackPropertyView = (propertyId: string, propertyTitle: string) => {
  trackEvent('view_property', {
    property_id: propertyId,
    property_title: propertyTitle,
  });
};

export const trackContactForm = (propertyId?: string, formType?: string) => {
  trackEvent('contact_form_submit', {
    property_id: propertyId,
    form_type: formType,
  });
};

export const trackCalculatorUse = (calculationType: string) => {
  trackEvent('calculator_use', {
    calculator_type: calculationType,
  });
};

export const trackSearchQuery = (query: string, filters?: Record<string, any>) => {
  trackEvent('search', {
    search_term: query,
    ...filters,
  });
};

// Declare gtag type for TypeScript
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, any>) => void;
  }
}
