export function NewsAndInsights() {
  const articles = [
    { title: 'Dubai Off‑Plan Market: Trends & Insights', excerpt: 'Analyzing Q3 launches, absorption, and pricing dynamics across prime communities.', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { title: 'Top Payment Plans for Investors in 2025', excerpt: 'From post‑handover to guaranteed rental—what works best for your strategy.', image: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { title: 'Communities to Watch: 2025‑2026 Pipeline', excerpt: 'Key master‑planned developments reshaping the off‑plan landscape.', image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map((a, i) => (
        <article key={i} className="bg-white rounded-xl shadow-lg overflow-hidden">
          <img src={a.image} alt={a.title} className="h-48 w-full object-cover" />
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">{a.title}</h3>
            <p className="mt-2 text-gray-600">{a.excerpt}</p>
            <a href="#" className="mt-4 inline-block text-gray-900 font-semibold">Read more →</a>
          </div>
        </article>
      ))}
    </div>
  );
}
