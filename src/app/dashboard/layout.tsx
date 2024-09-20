"use client";

import '../globals.css';
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { SidebarProvider } from "@/components/common/SidebarContext";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth(); // Now loading is tracked
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login'); // Redirect to login if the user is not authenticated
    }
  }, [user, loading, router]);

if (loading) {
  return (
    <div className="flex items-center justify-center bg-gray-800 w-full h-screen">
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: "#1f2937" }}>
        <img
          src="/images/preloader.gif"
          alt="Loading..."
          className="w-80 h-auto object-contain" // Adjust the size as needed
        />
      </div>
    </div>
  );
}


  if (!user) {
    return null; // Prevent rendering if the user is not authenticated
  }

  return (
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
  );
}

export default function LayoutWithAuth({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthProvider>
  );
}
