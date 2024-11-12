// src/components/common/Header.tsx
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { FaSearch, FaBell, FaChevronDown } from "react-icons/fa";
import { GrAnnounce } from "react-icons/gr";
import {
  fetchNotifications,
  markNotificationAsRead,
  getUnreadNotificationsCount,
} from "@/utils/notifications"; 
import { db } from "@/utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";


export default function Header() {
  const router = useRouter();
  const { isSidebarOpen } = useSidebar();
  const { userData, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isNoResults, setIsNoResults] = useState(false);
  const resultsRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const handleProfileClick = () => {
    if (userData?.position === "Admin") {
      router.push("/dashboard/profile");
    } else {
      router.push("/user-dashboard/profile");
    }
    closeMenu();
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleSearchChange = async (e) => {
    const queryValue = e.target.value;
    setSearchQuery(queryValue);

    if (queryValue.trim() === "") {
      setSearchResults([]);
      setIsNoResults(false);
      return;
    }

    const fetchProjects = async () => {
      try {
        const projectsRef = collection(db, "projects");
        const querySnapshot = await getDocs(projectsRef);
        const results = querySnapshot.docs
          .map((doc) => ({
            projectNo: doc.id,
            projectName: doc.data().projectName,
            projectStatus: doc.data().status || "Pending",
          }))
          .filter((project) =>
            project.projectName.toLowerCase().includes(queryValue.toLowerCase())
          );

        setSearchResults(results);
        setIsNoResults(results.length === 0);
      } catch (error) {
        console.error("Error searching projects:", error);
      }
    };

    fetchProjects();
  };

  const handleProjectClick = (projectNo) => {
    setSearchQuery("");
    setSearchResults([]);
    router.push(`/dashboard/projects/${projectNo}`);
  };

  const handleBellClick = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleNotificationClick = async (notification) => {
    const userEmail = userData?.email;
    if (userEmail) {
      await markNotificationAsRead(userEmail, notification.id);
      router.push(`/user-dashboard/announcement/${notification.targetId}`);
    }
  };

  useEffect(() => {
    const fetchUserNotifications = async () => {
      const userEmail = userData?.email;
      if (userEmail) {
        const fetchedNotifications = await fetchNotifications(userEmail); // Use utility function
        setNotifications(fetchedNotifications);
        const count = await getUnreadNotificationsCount(userEmail); // Use utility function
        setUnreadCount(count);
      }
    };

    fetchUserNotifications();
  }, [userData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        setSearchResults([]);
      }
      if (isDrawerOpen && !event.target.closest(".notification-drawer")) {
        setIsDrawerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDrawerOpen, isMenuOpen]);

  return (
    <div
      className={`fixed top-0 right-0 h-16 bg-white shadow-sm flex justify-between items-center px-4 transition-all duration-300`}
      style={{
        width: isSidebarOpen ? "calc(100% - 16rem)" : "calc(100% - 4rem)",
        marginLeft: isSidebarOpen ? "16rem" : "4rem",
        zIndex: 20,
      }}
    >
      <div className="relative w-full">
        <FaSearch className="absolute top-1 left-3 text-gray-500" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full pl-10 bg-transparent border-none focus:outline-none text-gray-700"
        />
        {(searchResults.length > 0 || isNoResults) && (
          <div
            ref={resultsRef}
            className="absolute mt-5 w-full bg-white shadow-lg rounded-md z-50"
          >
            {searchResults.length > 0 ? (
              searchResults.map((project) => (
                <div
                  key={project.projectNo}
                  onClick={() => handleProjectClick(project.projectNo)}
                  className="flex justify-between items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <span className="text-gray-800 font-medium">
                    {project.projectName}
                  </span>
                  <span
                    className={`text-xs rounded-full ${
                      project.projectStatus === "Pending"
                        ? "bg-red-400"
                        : "bg-green-400"
                    } text-white px-2 py-1`}
                  >
                    {project.projectStatus}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">Project not found</div>
            )}
          </div>
        )}
      </div>
      {/* Notifications */}
      <div className="flex items-center space-x-6 shrink-0">
        <div className="relative">
          <FaBell
            className="text-gray-600 text-lg cursor-pointer"
            onClick={handleBellClick}
          />
          {unreadCount > 0 && (
            <span className="absolute top-[-5px] right-[-5px] bg-red-500 text-white text-xs rounded-full px-1">
              {unreadCount}
            </span>
          )}
          {isDrawerOpen && (
            <div className="notification-drawer absolute right-0 mt-5 w-64 bg-white shadow-lg rounded-md z-50">
              <div className="py-2 px-4 text-gray-700 font-bold">
                Notifications
              </div>
              <div className="max-h-60 overflow-y-auto">
                {unreadCount === 0 ? (
                  <div className="px-4 py-2 text-gray-500">
                    No new notifications
                  </div>
                ) : (
                  notifications.slice(-10).map((notification) => (
                    <div
                      key={notification.id}
                      className="flex itemcenter gap-2 px-4 py-2 cursor-pointer"
                      onClick={() => {
                        handleNotificationClick(notification);
                      }}
                    >
                      <GrAnnounce />
                      <h3
                        className={`${
                          notification.isRead ? "font-normal" : "font-semibold"
                        }`}
                      >
                        {notification.title}
                      </h3>
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-center py-2 px-4">
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    router.push("/user-dashboard/notifications");
                  }}
                  className="bg-gray-200 px-2 py-1 rounded text-sm text-gray-600"
                >
                  See All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={toggleMenu} className="flex items-center space-x-1">
            <Image
              src={
                userData?.photo
                  ? `/images/users/${userData.email}/${userData.photo}`
                  : "/images/users/user.png"
              }
              alt="User Photo"
              className="w-8 h-8 rounded-full"
              width={32}
              height={32}
              sizes="32px"
            />
            <span className="font-medium">{userData?.name}</span>
            <FaChevronDown className="text-gray-600" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-50">
              <button
                onClick={handleProfileClick}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
