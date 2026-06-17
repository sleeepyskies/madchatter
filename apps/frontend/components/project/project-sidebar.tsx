"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LayoutBottomIcon,
  Mic01Icon,
  UserStarIcon,
  Video01Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";

// This is sample data.
const data = {
  teams: [
    {
      name: "Mad Chatter",
      logo: <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={2} />,
      plan: "",
    },
  ],
  navMain: [
    {
      title: "Videos",
      url: "/new-project/videos",
      icon: <HugeiconsIcon icon={Video01Icon} strokeWidth={2} />,
    },
    {
      title: "Speech",
      url: "/new-project/speech",
      icon: <HugeiconsIcon icon={Mic01Icon} strokeWidth={2} />,
    },
    {
      title: "Personality",
      url: "/new-project/personality",
      icon: <HugeiconsIcon icon={UserStarIcon} strokeWidth={2} />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-muted-foreground hover:text-black transition cursor-pointer"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
          Back to Dashboard
        </button>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
