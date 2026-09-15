import AppShell from "@/components/AppShell";
import JobStageList from "@/components/JobStageList";
export default function ProductionPage() { return <AppShell title="Drawings & manufacturing" description="Manage surveys, drawing approval and work moving through the workshop."><JobStageList mode="production" /></AppShell>; }
