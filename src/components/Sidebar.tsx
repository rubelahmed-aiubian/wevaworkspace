"use client";
import {
  FaTachometerAlt,
  FaList,
  FaUsers,
  FaUserFriends,
  FaProjectDiagram,
  FaCog,
  FaBars,
  FaBell,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useSidebar } from "./SidebarContext";

export default function Sidebar() {
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  const handleNavigation = (path: string) => {
    if(path === "dashboard"){router.push(`/${path}`)}
    else{
      router.push(`/dashboard/${path}`);
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-gray-800 text-white ${
        isSidebarOpen ? "w-64" : "w-16"
      } transition-all duration-300 flex flex-col`}
    >
      <div
        className={`flex items-center justify-between ${
          isSidebarOpen ? "p-4" : "p-5"
        } border-b border-gray-700`}
      >
        {isSidebarOpen && (
          <img src="/images/logo.png" alt="Logo" className="w-10" />
        )}
        <button onClick={toggleSidebar} className="text-xl">
          <FaBars />
        </button>
      </div>
      <nav className="flex-1 mt-4">
        <ul>
          {[
            { path: "dashboard", icon: FaTachometerAlt, label: "Dashboard" },
            { path: "mylist", icon: FaList, label: "My List" },
            { path: "projects", icon: FaProjectDiagram, label: "Projects" },
            { path: "teams", icon: FaUsers, label: "Teams" },
            { path: "members", icon: FaUserFriends, label: "Members" },
            { path: "announcement", icon: FaBell, label: "Announcement" },
          ].map((item, index) => (
            <li
              key={index}
              className={`flex items-center p-4 hover:bg-gray-700 cursor-pointer ${
                isSidebarOpen && "text-white"
              }`}
            >
              <button
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center w-full text-left`}
              >
                <item.icon className="mr-3" />
                {isSidebarOpen && item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div
        className={`p-4 border-t border-gray-700 mt-auto flex items-center justify-center hover:bg-gray-700 cursor-pointer ${
          isSidebarOpen && "text-white"
        }`}
      >
        <button
          onClick={() => handleNavigation("settings")}
          className={`flex items-center w-full text-left`}
        >
          <FaCog className="mr-2" />
          {isSidebarOpen && "Settings"}
        </button>
      </div>
    </div>
  );
}