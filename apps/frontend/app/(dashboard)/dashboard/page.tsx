"use client";
import { useRouter } from "next/navigation";
import { useDashboardHeader } from "@/components/dashboard-header-provider";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();
  const { setDashboardTitle } = useDashboardHeader();
  useEffect(() => {
    setDashboardTitle("Dashboard");
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-8 pt-0 text-lg">
      <div className="flex flex-col items-start justify-center gap-3 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back!👋
        </h1>

        <p className="text-muted-foreground">
          Create your customized AI agent quickly!
        </p>

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => router.push("/project/new")}
            className="rounded-lg bg-black text-white px-5 py-3 text-base hover:bg-black/80 cursor-pointer"
          >
            New Project
          </button>
        </div>
      </div>
    </div>
  );
}
