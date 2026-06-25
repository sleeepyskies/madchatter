import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AdminSidebar/>
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
