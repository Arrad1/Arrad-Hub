import Link from "next/link"
 export default function Home() {
  const modules = [
    { title: "Jobs", icon: "🔧", text: "Quotes, live jobs, surveys & installations" },
    { title: "Customers", icon: "👥", text: "Customer database & communication" },
    { title: "Holiday Parks", icon: "🏕️", text: "Park database, contacts & opportunities" },
    { title: "Stock & Materials", icon: "📦", text: "Stock levels, job picking & ordering" },
    { title: "Suppliers", icon: "🚚", text: "Suppliers, purchase orders & invoices" },
    { title: "Accounts", icon: "£", text: "Invoices, payments, costs & profitability" },
    { title: "Documents", icon: "📄", text: "Drawings, photos, certificates & paperwork" },
    { title: "Marketing", icon: "📈", text: "Leads, campaigns & new park opportunities" },
  ];

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-slate-950 text-white px-6 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">ARRAD HUB</h1>
            <p className="text-slate-400 text-sm">
              Arrad Foot Balconies Ltd
            </p>
          </div>

          <div className="text-right">
            <p className="font-semibold">Business Control Centre</p>
            <p className="text-xs text-slate-400">Live Dashboard</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Good morning
          </h2>
          <p className="text-slate-600 mt-1">
            Everything you need to run the business in one place.
          </p>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <DashboardCard title="Active Jobs" value="0" />
          <DashboardCard title="Quotes Awaiting" value="0" />
          <DashboardCard title="Orders Required" value="0" />
          <DashboardCard title="Invoices Due" value="£0" />
        </section>

        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Arrad Hub
        </h2>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {modules.map((module) => (
            <Link
            href="/jobs"
              key={module.title}
              className="bg-white text-left rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-400 transition"
            >
              <div className="text-3xl mb-4">{module.icon}</div>
              <h3 className="font-bold text-lg text-slate-900">
                {module.title}
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                {module.text}
              </p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
    </div>
  );
}
