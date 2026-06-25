"use client";

import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface ResourcePageLayoutProps {
  title: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export function ResourcePageLayout({
                                     title,
                                     headerAction,
                                     children,
                                   }: ResourcePageLayoutProps) {
  return (
    <div className="flex flex-col flex-1 w-full">
      {/* Structural Top Header Bar (Old AdminHeader logic, now inline) */}
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear border-b border-border/40">
        <div className="flex items-center gap-2 px-4 w-full justify-between">
          <div className="flex items-center gap-2">
            <Separator
              orientation="vertical"
              className="mr-2 h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard" className="normal-case tracking-normal">
                    Mad Chatter
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="normal-case tracking-normal font-medium">
                    {title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Header Action Button sits up top next to breadcrumbs now */}
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 p-6 min-h-0">
        {children}
      </main>
    </div>
  );
}
