import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {AdminSidebar} from "@/components/admin-sidebar";
import {AdminHeader} from "@/components/admin-header";
import { AdminHeaderProvider } from "../../providers/admin-header-provider";
import React from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminHeaderProvider>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <AdminHeader/>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </AdminHeaderProvider>
  );
}
