export default function JobsPage() {
  const cards = [
    { title: "Quotes", value: 0, href: "/jobs/quotes" },
    { title: "Live Jobs", value: 0 },
    { title: "Surveys", value: 0 },
    { title: "Installations", value: 0 },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-10">
      <div className="mx-auto max-w-6xl">
        <a href="/" className="text-sm text-slate-600">
          ← Back to Arrad Hub
        </a>

        <h1 className="mt-6 text-3xl font-bold text-slate-900">Jobs</h1>
        <p className="mt-2 text-slate-600">
          Manage quotes, live jobs, surveys and installations.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <a href={card.href}
              key={card.title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-slate-500">{card.title}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {card.value}
              </p>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
