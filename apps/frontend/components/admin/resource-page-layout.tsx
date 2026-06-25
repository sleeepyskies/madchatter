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
import { Skeleton } from "@/components/ui/skeleton";

interface ResourcePageLayoutProps {
  title: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  itemsCount?: number;
  resourceName?: string;
  isLoading?: boolean;
}

export function ResourcePageLayout({
                                     title,
                                     headerAction,
                                     children,
                                     itemsCount,
                                     resourceName = "resources",
                                     isLoading = false,
                                   }: ResourcePageLayoutProps) {
  const isEmpty = !isLoading && itemsCount === 0;

  return (
    <div className="flex flex-col flex-1 w-full">
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear border-b border-border/40">
        <div className="flex items-center gap-2 px-4 w-full justify-between">
          <div className="flex items-center gap-2">
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Mad Chatter</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage> {title} </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      </header>

      <main className="flex-1 p-6 min-h-0">
        {isEmpty ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
            No {resourceName} found.
          </div>
        ) : (
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="min-h-[192px] w-full rounded-xl" />
              ))
              : children}
          </div>
        )}
      </main>
    </div>
  );
}
