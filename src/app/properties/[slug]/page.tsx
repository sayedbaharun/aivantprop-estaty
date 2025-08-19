'use client';

import { useState, useEffect, use } from 'react';
import { getApiUrl } from '@/lib/api-url';
import { FloorPlanExplorer } from '@/components/floor-plan-explorer';
import { ContactForm } from '@/components/contact-form';
import { StickyPropertyHeader } from '@/components/sticky-property-header';
import { PropertyLocationMap } from '@/components/dynamic-property-map';
import { Metadata } from 'next';

async function getData(slug: string) {
  const res = await fetch(`${getApiUrl()}/api/properties/${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const result = await getData(resolvedParams.slug);
      setData(result);
      setLoading(false);
    }
    fetchData();
  }, [resolvedParams.slug]);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.querySelector('section[data-hero]');
      if (heroSection) {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        setShowStickyHeader(heroBottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return <div className="max-w-4xl mx-auto p-8">Loading...</div>;
  if (!data?.success) return <div className="max-w-4xl mx-auto p-8">Property not found.</div>;
  
  const { property, relatedProperties, stats } = data.data;
  const hero = property?.images?.find((img: any) => img.tag === 'HERO')?.url || property?.heroImage || '/placeholder.svg';
  const priceText = property.minPrice ? `From AED ${Math.round(property.minPrice).toLocaleString('en-AE')}` : 'Price on request';

  return (
    <main className="min-h-screen">
      {/* Sticky Header */}
      <StickyPropertyHeader 
        propertyTitle={property.title}
        propertyPrice={priceText}
        propertyId={property.id}
        isVisible={showStickyHeader}
      />

      <section className="relative" data-hero>
        <img src={hero} alt={property.title} className="h-[360px] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-3xl lg:text-4xl font-bold">{property.title}</h1>
          <p className="text-white/80">{property?.developer?.name} • {property?.city?.name}{property?.district ? `, ${property.district.name}` : ''}</p>
        </div>
        
        {/* Hero CTAs */}
        <div className="absolute bottom-6 right-6 flex space-x-3">
          <button 
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg backdrop-blur-sm transition-all duration-200 flex items-center"
            onClick={() => {
              const message = `Hi, I'm interested in ${property.title}. Can you send me the brochure?`;
              window.open(`https://wa.me/971501234567?text=${encodeURIComponent(message)}`, '_blank');
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Get Brochure
          </button>
          <button 
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200"
            onClick={() => document.getElementById('enquire')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Enquire Now
          </button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-3">Overview</h2>
            <p className="text-gray-700 leading-relaxed">{property.description || 'No description available.'}</p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><div className="text-gray-500">Status</div><div className="font-medium">{property.salesStatus?.replace(/_/g,' ')}</div></div>
              <div><div className="text-gray-500">Price</div><div className="font-medium">{property.minPrice ? `From AED ${Math.round(property.minPrice).toLocaleString('en-AE')}` : 'On request'}</div></div>
              <div><div className="text-gray-500">Handover</div><div className="font-medium">{property.handoverYear ? `Q${property.handoverQuarter || '-'} ${property.handoverYear}` : 'TBA'}</div></div>
              <div><div className="text-gray-500">Units</div><div className="font-medium">{stats?.totalUnits || 0}</div></div>
            </div>

            {/* Mid-content CTAs */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button 
                  className="px-4 py-3 bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium rounded-lg border border-teal-200 transition-colors duration-200 flex items-center justify-center"
                  onClick={() => {
                    const message = `Hi, I'd like to schedule a viewing for ${property.title}`;
                    window.open(`https://wa.me/971501234567?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule Viewing
                </button>

                <button 
                  className="px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium rounded-lg border border-amber-200 transition-colors duration-200 flex items-center justify-center"
                  onClick={() => {
                    window.location.href = `/investment?property=${encodeURIComponent(property.title)}`;
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  ROI Calculator
                </button>

                <button 
                  className="px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg border border-blue-200 transition-colors duration-200 flex items-center justify-center"
                  onClick={() => {
                    const subject = `Payment Plan Inquiry - ${property.title}`;
                    const body = `Hi, I would like to know about the payment plans available for ${property.title}.`;
                    window.open(`mailto:info@offplandub.ai?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Payment Plans
                </button>
              </div>
            </div>
          </div>

          <FloorPlanExplorer floorPlans={(property.floorPlans || []).map((fp: any) => ({
            id: fp.id,
            title: fp.title,
            planType: fp.planType,
            bedrooms: fp.bedrooms,
            bathrooms: fp.bathrooms,
            size: fp.size,
            imageUrl: fp.imageUrl,
            pdfUrl: fp.pdfUrl,
          }))} />

                                <PropertyLocationMap 
                        property={property}
                        nearbyProperties={relatedProperties}
                        className="mb-8"
                      />

                      {property.images?.length ? (
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                          <h2 className="text-xl font-semibold mb-4">Gallery</h2>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {property.images.slice(0, 12).map((img: any, i: number) => (
                              <img key={i} src={img.url} alt={img.alt || property.title} className="h-40 w-full object-cover rounded-lg" />
                            ))}
                          </div>
                        </div>
                      ) : null}
        </div>

        <aside className="space-y-6">
          <div id="enquire" className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Property Enquiry</h3>
            <p className="text-gray-600 text-sm mb-4">Request brochure, floor plans or a private viewing.</p>
            <ContactForm 
              propertyId={property?.id}
              propertyTitle={property?.title}
              type="property_inquiry"
            />
          </div>

          {relatedProperties?.length ? (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Similar Properties</h3>
              <div className="space-y-4">
                {relatedProperties.map((rp: any) => (
                  <div key={rp.id} className="border border-gray-100 rounded-lg p-3 hover:border-teal-200 hover:bg-teal-50/30 transition-colors">
                    <div className="flex gap-3 items-start">
                      <img src={rp.images?.[0]?.url || '/placeholder.svg'} className="h-16 w-20 object-cover rounded" alt={rp.title} />
                      <div className="flex-1 min-w-0">
                        <a href={`/properties/${rp.slug}`} className="font-medium text-gray-900 hover:text-teal-600 line-clamp-1 block">
                          {rp.title}
                        </a>
                        <div className="text-sm text-gray-600">{rp?.developer?.name}</div>
                        <div className="text-xs text-teal-600 font-medium mt-1">
                          {rp.minPrice ? `From AED ${Math.round(rp.minPrice).toLocaleString('en-AE')}` : 'Price on request'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Property-specific CTAs */}
                    <div className="flex gap-2 mt-3">
                      <button 
                        className="flex-1 px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-medium rounded border border-teal-200 transition-colors"
                        onClick={() => {
                          const message = `Hi, I'm interested in comparing ${property.title} with ${rp.title}. Can you help?`;
                          window.open(`https://wa.me/971501234567?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                      >
                        Compare
                      </button>
                      <a 
                        href={`/properties/${rp.slug}`}
                        className="flex-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-200 transition-colors text-center"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Additional CTA for more properties */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button 
                  className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200"
                  onClick={() => {
                    const message = `Hi, I'm looking at ${property.title}. Can you show me more similar properties in ${property?.city?.name}?`;
                    window.open(`https://wa.me/971501234567?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                >
                  Find More Similar Properties
                </button>
              </div>
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
