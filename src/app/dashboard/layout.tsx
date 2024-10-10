//src/app/dashboard/layout.tsx
"use client";

import '../globals.css';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import { AuthProvider, useAuth } from "@/context/AuthContext"; 
import { SidebarProvider } from "@/components/common/SidebarContext";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

useEffect(() => {
  if (!loading) {
    if (!user) {
      router.push('/login');
    }
  }
}, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-800 w-full h-screen">
        <img
          src="/images/preloader.gif"
          alt="Loading..."
          className="w-80 h-auto object-contain" // Adjust the size as needed
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function LayoutWithAuth({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthProvider>
  );
}
