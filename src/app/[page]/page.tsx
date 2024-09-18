"use client";
import Teams from "@/components/Teams";
import MyList from "@/components/MyList";
import Profile from "@/components/Profile";
import Members from "@/components/Members";
import Settings from "@/components/Settings";
import { usePathname } from "next/navigation";
import ProjectList from "@/components/ProjectList";
import Announcement from "@/components/Announcement";
import { useSidebar } from "@/components/SidebarContext";
import DashboardContent from "@/components/DashboardContent";

const componentMapping = {
  dashboard: { component: DashboardContent, title: "Dashboard" },
  mylist: { component: MyList, title: "My List" },
  projects: { component: ProjectList, title: "Projects" },
  teams: { component: Teams, title: "Teams" },
  members: { component: Members, title: "Members" },
  announcement: { component: Announcement, title: "Announcement" },
  settings: { component: Settings, title: "Settings" },
  profile: { component: Profile, title: "Profile" },
};

export default function Page() {
  const { isSidebarOpen } = useSidebar();
  const pathname = usePathname();
  const pathKey = pathname?.slice(1).toLowerCase();
  const { component: Component, title } = componentMapping[pathKey] || { component: DashboardContent, title: "Dashboard" };

  return (
    <div className={`flex-auto ${isSidebarOpen ? "ml-64" : "ml-16"} mt-16 transition-all duration-300`}>
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <Component />
    </div>
  );
}
