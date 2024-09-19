"use client"
import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/SidebarContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import '../globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }){
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  if (!isHydrated) {
    return null;
  }

  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <div className="flex">
            <Sidebar />
            <div className="flex-1">
              <Header />
              <main className="p-6">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
