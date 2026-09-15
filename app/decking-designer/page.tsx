import AppShell from "@/components/AppShell";
import DeckingDesigner from "@/components/decking/DeckingDesigner";

export default function DeckingDesignerPage() {
  return (
    <AppShell title="Modular decking designer" description="Build a decking layout from Arrad’s 24 standard modular box sections.">
      <DeckingDesigner />
    </AppShell>
  );
}

