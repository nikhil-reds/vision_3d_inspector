import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsView } from "@/components/settings/SettingsView";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Configure your workspace, display preferences and default inspection behaviour."
        breadcrumbs={[{ label: "Workspace", href: "/dashboard" }, { label: "Settings" }]}
      />
      <SettingsView />
    </>
  );
}
