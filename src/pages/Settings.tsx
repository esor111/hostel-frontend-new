import { MainLayout } from "@/components/layout/MainLayout";
import { Settings as SettingsComponent } from "@/components/admin/Settings";

export default function Settings() {
  return (
    <MainLayout activeTab="settings">
      <SettingsComponent />
    </MainLayout>
  );
}