export async function DeveloperShowcase() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/developers?limit=12`, { next: { revalidate: 600 } });
  const json = await res.json();
  const developers = json?.data || [];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
      {developers.map((d: any) => (
        <a key={d.id} href={`/developers/${d.slug}`} className="bg-white rounded-xl p-6 shadow-lg flex flex-col items-center gap-3 hover:shadow-xl transition-shadow">
          {d.logo ? (
            <img src={d.logo} alt={d.name} className="h-10 object-contain" />
          ) : (
            <div className="h-10 w-24 bg-gray-100 rounded" />
          )}
          <span className="text-sm font-medium text-gray-900 text-center line-clamp-2">{d.name}</span>
        </a>
      ))}
    </div>
  );
}
