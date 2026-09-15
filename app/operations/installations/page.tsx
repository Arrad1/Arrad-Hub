import AppShell from "@/components/AppShell";
import JobStageList from "@/components/JobStageList";
export default function InstallationsPage() { return <AppShell title="Installations" description="Schedule ready jobs, track work on site and mark installations complete."><JobStageList mode="installation" /></AppShell>; }
