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

const componentList = [
  {
    name: "dashboard",
    component: DashboardContent,
    title: "Dashboard",
  },
  {
    name: "mylist",
    component: MyList,
    title: "My List",
  },
  {
    name: "projects",
    component: Project,
    title: "Projects",
  },
  {
    name: "teams",
    component: Teams,
    title: "Teams",
  },
  {
    name: "members",
    component: Members,
    title: "Members",
  },
  {
    name: "announcement",
    component: Announcement,
    title: "Announcement",
  },
  {
    name: "settings",
    component: Settings,
    title: "Settings",
  },
  {
    name: "profile",
    component: Profile,
    title: "Profile",
  },
  {
    name: "notifications",
    component: Notifications,
    title: "Notifications",
  },
];

export default function Page() {
  const { isSidebarOpen } = useSidebar();
  const pathname = usePathname();
  const pathKey = pathname?.split("/")[2].toLowerCase();
  const itemKey=componentList.findIndex(item=>item.name==pathKey)??0;
  const Component = componentList[itemKey];
  return (
    <div
      className={`flex-auto ${
        isSidebarOpen ? "ml-64" : "ml-16"
      } mt-16 transition-all duration-300`}
    >
      <h1 className="text-2xl font-bold mb-4">{Component.title}</h1>
      <Component.component />
    </div>
  );
}
