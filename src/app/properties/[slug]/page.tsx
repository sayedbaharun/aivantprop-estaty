import { FloorPlanExplorer } from '@/components/floor-plan-explorer';
import { ContactForm } from '@/components/contact-form';
import { Metadata } from 'next';

async function getData(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/properties/${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const data = await getData(params.slug);
  const property = data?.data?.property;
  const title = property?.title ? `${property.title} | Off Plan Dub.ai` : 'Property | Off Plan Dub.ai';
  const description = property?.description || 'Explore property details, floor plans and pricing.';
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: property?.images?.[0]?.url ? [property.images[0].url] : undefined,
    }
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const data = await getData(params.slug);
  if (!data?.success) return <div className="max-w-4xl mx-auto p-8">Property not found.</div>;
  const { property, relatedProperties, stats } = data.data;

  const hero = property?.images?.find((img: any) => img.tag === 'HERO')?.url || property?.heroImage || '/placeholder.svg';

  return (
    <main className="min-h-screen">
      <section className="relative">
        <img src={hero} alt={property.title} className="h-[360px] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-3xl lg:text-4xl font-bold">{property.title}</h1>
          <p className="text-white/80">{property?.developer?.name} • {property?.city?.name}{property?.district ? `, ${property.district.name}` : ''}</p>
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
              <h3 className="text-lg font-semibold mb-3">Related Properties</h3>
              <div className="space-y-3">
                {relatedProperties.map((rp: any) => (
                  <a key={rp.id} href={`/properties/${rp.slug}`} className="flex gap-3 items-center">
                    <img src={rp.images?.[0]?.url || '/placeholder.svg'} className="h-16 w-20 object-cover rounded" alt={rp.title} />
                    <div>
                      <div className="font-medium text-gray-900 line-clamp-1">{rp.title}</div>
                      <div className="text-sm text-gray-600">{rp?.developer?.name}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
