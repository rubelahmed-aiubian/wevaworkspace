"use client";
import { useState } from "react";
import { usePathname, notFound } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MyList from "@/components/MyList";
import ProjectList from "@/components/ProjectList";
import DashboardContent from "@/components/DashboardContent";
import Team from "@/components/Teams";
import Members from "@/components/Members";
import Announcement from "@/components/Announcement";
import Settings from "@/components/Settings";
import Profile from "@/components/Profile";

const components = {
  dashboard: DashboardContent,
  mylist: MyList,
  projects: ProjectList,
  teams: Team,
  members: Members,
  announcement: Announcement,
  settings: Settings,
  profile: Profile,
};

export default function Page() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const Component = components[pathname?.slice(1).toLowerCase()] || notFound;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`flex-auto ${isSidebarOpen ? "ml-64" : "ml-16"} mt-16`}>
        <Header isOpen={isSidebarOpen} />
        <div className="p-6 flex-1 overflow-auto">
          <Component />
        </div>
      </div>
    </div>
  );
}