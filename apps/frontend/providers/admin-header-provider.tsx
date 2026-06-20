"use client";
import { createContext, useContext, useState } from "react";

const AdminHeaderContext = createContext<{
  title: string;
  setTitle: (t: string) => void;
}>({
  title: "", setTitle: () => {
  }
});

export function AdminHeaderProvider({children}: { children: React.ReactNode }) {
  const [title, setTitle] = useState("");
  return (
    <AdminHeaderContext.Provider value={{title: title, setTitle: setTitle}}>
      {children}
    </AdminHeaderContext.Provider>
  );
}

export const useAdminHeader = () => useContext(AdminHeaderContext);
