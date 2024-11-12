"use client";

import "../globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import UserSidebar from "@/components/common/User-Sidebar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { SidebarProvider } from "@/components/common/SidebarContext";
import Image from "next/image";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false); // Track redirecting state

  useEffect(() => {
    if (!loading && userData) {
      // If user is an Admin, redirect to the Admin dashboard
      if (userData.position === "Admin") {
        setRedirecting(true);
        router.push("/dashboard");
      }
    } else if (!user && !loading) {
      // If user is not logged in, redirect to login
      setRedirecting(true);
      router.push("/login");
    }
  }, [user, loading, userData, router]);

  if (loading || redirecting) {
    return (
      <div className="flex items-center justify-center bg-gray-800 w-full h-screen">
        <Image
          src="/images/preloader.gif"
          width={100}
          height={100}
          alt="Loading..."
          className="w-80 h-auto object-contain"
        />
      </div>
    );
  }

  // If userData is loaded and the user is an Admin, do not render this layout
  if (!user || (userData && userData.position === "Admin")) {
    return null; // Avoid rendering the layout for unauthorized users
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <UserSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function LayoutWithAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthProvider>
  );
}
