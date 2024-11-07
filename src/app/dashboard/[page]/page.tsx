//src/app/dashboard/[page]/page.tsx
"use client";
import Teams from "@/components/dashboard/Teams";
import MyList from "@/components/dashboard/MyList";
import Project from "@/components/dashboard/Project";
import Members from "@/components/dashboard/Members";
import Announcement from "@/components/dashboard/Announcement";
import Settings from "@/components/dashboard/Settings";
import DashboardContent from "@/components/dashboard/DashboardContent";
import Profile from "@/components/dashboard/Profile";
import Notifications from "@/components/common/Notifications";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/common/SidebarContext";

const componentMapping = {
  mylist: { component: MyList, title: "My List" },
  projects: { component: Project, title: "Projects" },
  teams: { component: Teams, title: "Teams" },
  members: { component: Members, title: "Members" },
  announcement: { component: Announcement, title: "Announcement" },
  settings: { component: Settings, title: "Settings" },
  profile: { component: Profile, title: "Profile" },
  notifications: { component: Notifications, title: "Notifications" },
};

export default function Page() {
  const { isSidebarOpen } = useSidebar();
  const pathname = usePathname();
  const pathSegments = pathname?.split("/");
  const pathKey = pathSegments[2]?.toLowerCase();

  let Component;
  let title;

  // Default to the corresponding component from the mapping
  const componentData = componentMapping[pathKey] || {
    component: DashboardContent,
    title: "Dashboard",
  };
  Component = componentData.component;
  title = componentData.title;

  return (
    <div
      className={`flex-auto ${
        isSidebarOpen ? "ml-64" : "ml-16"
      } mt-16 transition-all duration-300`}
    >
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <Component />
    </div>
  );
}
