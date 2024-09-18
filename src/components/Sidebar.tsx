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
    router.push(`/${path}`);
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
            "dashboard",
            "mylist",
            "projects",
            "teams",
            "members",
            "announcement",
          ].map((path, index) => (
            <li
              key={index}
              className={`flex items-center p-4 hover:bg-gray-700 cursor-pointer ${
                isSidebarOpen && "text-white"
              }`}
            >
              <button
                onClick={() => handleNavigation(path)}
                className={`flex items-center ${
                  isSidebarOpen ? "hover:bg-gray-700" : ""
                } w-full text-left`}
              >
                {path === "dashboard" && <FaTachometerAlt className="mr-3" />}
                {path === "mylist" && <FaList className="mr-3" />}
                {path === "projects" && <FaProjectDiagram className="mr-3" />}
                {path === "teams" && <FaUsers className="mr-3" />}
                {path === "members" && <FaUserFriends className="mr-3" />}
                {path === "announcement" && <FaBell className="mr-3" />}
                {isSidebarOpen && path.charAt(0).toUpperCase() + path.slice(1)}
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
          className={`flex items-center ${
            isSidebarOpen ? "hover:bg-gray-700" : ""
          } w-full text-left`}
        >
          <FaCog className="mr-2" />
          {isSidebarOpen && "Settings"}
        </button>
      </div>
    </div>
  );
}
