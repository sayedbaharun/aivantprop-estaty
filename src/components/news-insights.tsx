export function NewsAndInsights() {
  const articles = [
    { title: 'Dubai Off‑Plan Market: Trends & Insights', excerpt: 'Analyzing Q3 launches, absorption, and pricing dynamics across prime communities.', image: '/images/news1.jpg' },
    { title: 'Top Payment Plans for Investors in 2025', excerpt: 'From post‑handover to guaranteed rental—what works best for your strategy.', image: '/images/news2.jpg' },
    { title: 'Communities to Watch: 2025‑2026 Pipeline', excerpt: 'Key master‑planned developments reshaping the off‑plan landscape.', image: '/images/news3.jpg' },
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
