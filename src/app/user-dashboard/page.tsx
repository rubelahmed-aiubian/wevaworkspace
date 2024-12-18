"use client";
import { useSidebar } from "@/components/common/SidebarContext";
import UserDashboardContent from "@/components/user-dashboard/UserDashboardContent";

export default function DashboardPage() {
  const { isSidebarOpen } = useSidebar();

  return (
    <div
      className={`flex-auto ${
        isSidebarOpen ? "ml-64" : "ml-16"
      } mt-16 transition-all duration-300`}
    >
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <UserDashboardContent />
    </div>
  );
}
