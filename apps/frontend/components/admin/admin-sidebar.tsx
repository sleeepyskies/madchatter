"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";
import {
  BookOpen02Icon,
  Brain03Icon,
  CropIcon,
  LayoutBottomIcon,
  RoboticIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItem {
  title: string;
  url: string;
  icon: IconSvgElement
}

const items: SidebarItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutBottomIcon,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: CropIcon,
  },
  {
    title: "Agents",
    url: "/agents",
    icon: RoboticIcon,
  },
  {
    title: "Knowledge Bases",
    url: "/knowledge-bases",
    icon: Brain03Icon,
  },
  {
    title: "Documentation",
    url: "https://madchatter.pages.dev",
    icon: BookOpen02Icon,
  },
];

interface SidebarLinkProps {
  item: SidebarItem;
  isActive: boolean;
}

function SidebarLink({item, isActive}: SidebarLinkProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={item.url}>
          <HugeiconsIcon icon={item.icon} strokeWidth={2}/>
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AdminSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>

      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-transparent active:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent"
            >
              {/* TODO: Logo goes here. */}
              <div
                className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={2}/>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Mad Chatter</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => {
              const isActive = pathname === item.url;
              return (<SidebarLink item={item} isActive={isActive} key={item.title}/>);
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail/>

    </Sidebar>
  );
}
