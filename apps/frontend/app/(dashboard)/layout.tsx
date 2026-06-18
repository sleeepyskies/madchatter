import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {DashboardHeaderProvider} from "@/components/dashboard-header-provider";
import {DashboardHeader} from "@/components/dashboard-header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardHeaderProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader/>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </DashboardHeaderProvider>
  );
}
