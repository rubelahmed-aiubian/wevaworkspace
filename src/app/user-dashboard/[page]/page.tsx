//src/app/user-dashboard/[page]/page.tsx
"use client";
import UserDashboardContent from "@/components/user-dashboard/UserDashboardContent";
import MyTasks from "@/components/user-dashboard/MyTasks";
import Announcement from "@/components/user-dashboard/Announcement";
import MyProjects from "@/components/user-dashboard/MyProjects";
import MyTeams from "@/components/user-dashboard/MyTeams";
import ChangePassword from "@/components/user-dashboard/ChangePassword";
import Profile from "@/components/user-dashboard/Profile";
import Notifications from "@/components/common/Notifications";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/common/SidebarContext";

const componentMapping = {
  mytasks: { component: MyTasks, title: "My Tasks" },
  myprojects: { component: MyProjects, title: "My Projects" },
  myteams: { component: MyTeams, title: "My Teams" },
  announcement: { component: Announcement, title: "Announcement" },
  changepassword: { component: ChangePassword, title: "Change Password" },
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
  const componentData = componentMapping[
    pathKey as keyof typeof componentMapping
  ] || {
    component: UserDashboardContent,
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
      <h1 className="text-xl font-bold mb-4">{title}</h1>
      <Component />
    </div>
  );
}
