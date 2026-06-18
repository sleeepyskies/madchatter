"use client";
import {createContext, useContext, useState} from "react";

const DashboardHeaderContext = createContext<{
  dashboardTitle: string;
  setDashboardTitle: (t: string) => void;
}>({
  dashboardTitle: "", setDashboardTitle: () => {
  }
});

export function DashboardHeaderProvider({children}: { children: React.ReactNode }) {
  const [title, setTitle] = useState("");
  return (
    <DashboardHeaderContext.Provider value={{dashboardTitle: title, setDashboardTitle: setTitle}}>
      {children}
    </DashboardHeaderContext.Provider>
  );
}

export const useDashboardHeader = () => useContext(DashboardHeaderContext);
