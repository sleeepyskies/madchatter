"use client";

import * as React from "react";
import Image from "next/image";
import logo from "@/src/img/logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookIcon,
  BotIcon,
  DatabaseIcon,
  FolderPlusIcon,
  LayoutDashboardIcon,
  LucideIcon,
  PanelBottomIcon,
} from "lucide-react";

interface SidebarItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

const items: SidebarItem[] = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboardIcon },
  { title: "Projects", url: "/admin/projects", icon: FolderPlusIcon },
  { title: "Agents", url: "/admin/agents", icon: BotIcon },
  {
    title: "Knowledge Bases",
    url: "/admin/knowledge-bases",
    icon: DatabaseIcon,
  },
  {
    title: "Documentation",
    url: "https://madchatter.pages.dev",
    icon: BookIcon,
  },
];

interface SidebarLinkProps {
  item: SidebarItem;
  isActive: boolean;
}

function SidebarLink({ item, isActive }: SidebarLinkProps) {
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={item.url}>
          <Icon className="w-4 h-4" strokeWidth={2} />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div
              className={`flex h-12 w-full items-center px-2 transition-all duration-200 ${open ? "justify-between" : "justify-center"}`}
            >
              <div className="flex items-center gap-2 overflow-hidden min-w-0">
                {/* <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"> */}
                {/* <PanelBottomIcon className="w-4 h-4" /> */}
                <Image src={logo} alt="logo" className="w-9 h-9" />
                {/* </div> */}
                {open && (
                  <div className="grid flex-1 text-left text-base leading-tight animate-in fade-in slide-in-from-left-2 duration-200">
                    <span className="truncate font-semibold text-sidebar-foreground">
                      Mad Chatter
                    </span>
                  </div>
                )}
              </div>

              <SidebarTrigger className="h-8 w-8 hover:bg-sidebar-accent shrink-0 animate-in fade-in duration-200" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => {
              const isActive = pathname === item.url;
              return (
                <SidebarLink item={item} isActive={isActive} key={item.title} />
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
