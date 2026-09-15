export default function StatusBadge({ children }: { children: string }) {
  const positive = ["Accepted", "Approved", "Paid", "Complete", "Ready"].includes(children);
  const warning = ["New", "Draft", "Not started", "Not raised", "Overdue"].includes(children);
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${positive ? "bg-emerald-50 text-emerald-700" : warning ? "bg-[#f1f9e5] text-[#4e8500]" : "bg-blue-50 text-blue-700"}`}>{children}</span>;
}
