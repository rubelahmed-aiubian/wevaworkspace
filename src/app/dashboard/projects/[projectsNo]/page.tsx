"use client";

import { db } from "@/utils/firebase";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";
import Task from "@/components/dashboard/project/Task";
import Overview from "@/components/dashboard/project/Overview";
import { useSidebar } from "@/components/common/SidebarContext";

export default function ProjectDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  const projectNo = pathname?.split("/")[3];
  const { isSidebarOpen } = useSidebar();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState("");
  const [project, setProject] = useState(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    sec: 0,
  });
  const [isUpdating, setIsUpdating] = useState(false); // State to manage loading spinner
  const [startDate, setStartDate] = useState<Date | null>(null); // State for start date
  const [endDate, setEndDate] = useState<Date | null>(null); // State for end date
  const [notification, setNotification] = useState<string | null>(null); // State for notification message
  const [showNotification, setShowNotification] = useState(false); // State for notification visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown visibility
  const spin = "animate-spin rounded-full h-5 w-5 border-b-2 border-white"; //loading white spinner
  const spin2 =
    "animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"; //loading indigo spinner

  // Fetch project details from Firebase
  useEffect(() => {
    const fetchProjectDetails = () => {
      if (projectNo && user) {
        const projectDocRef = doc(db, "projects", projectNo);
        // Use onSnapshot for real-time updates
        const unsubscribe = onSnapshot(projectDocRef, (projectDoc) => {
          if (projectDoc.exists()) {
            const projectData = projectDoc.data();
            setProject(projectData);
            setStatus(projectData.projectStatus);
            // Set the start and end dates from project data
            setStartDate(
              projectData.startDate ? new Date(projectData.startDate) : null
            );
            setEndDate(
              projectData.endDate ? new Date(projectData.endDate) : null
            );

            // Set status to Pending if start date is greater than the current date
            if (
              projectData.startDate &&
              new Date(projectData.startDate) > new Date()
            ) {
              setStatus("Pending");
            }
          }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
      }
    };
    fetchProjectDetails();
  }, [projectNo, user]);

  // Timer state management
  useEffect(() => {
    if (startDate && endDate && status !== "Pending") {
      const targetTime = endDate.getTime();
      const interval = setInterval(() => {
        const currentTime = new Date().getTime();
        const difference = targetTime - currentTime;

        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            mins: Math.floor((difference / 1000 / 60) % 60),
            sec: Math.floor((difference / 1000) % 60),
          });
        } else {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startDate, endDate, status]);

  // Update the status based on the end date
  useEffect(() => {
    if (endDate) {
      if (new Date(endDate) < new Date()) {
        setStatus("Due Project");
      }
    }
  }, [endDate]);

  // Function to handle tab change
  const handleTabClick = (tab: string) => {
    setSelectedTab(tab);
    if (tab === "overview") {
      router.push(`${pathname}?show=overview`, undefined, { shallow: true });
    } else {
      router.push(`${pathname}?show=task`, undefined, { shallow: true });
    }
  };

  // Handle status change and update Firebase
  const handleStatusChange = async (newStatus: string) => {
    if (status === "Due Project" && endDate && new Date() > endDate) {
      setNotification("Project end date expired");
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 2000);
      return;
    }

    // Check if the project has started
    if (startDate && new Date() < startDate) {
      setNotification("Project is not started yet");
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 2000);
      return;
    }

    setIsUpdating(true); // Start the loading spinner
    setStatus(newStatus);

    if (projectNo) {
      const projectDocRef = doc(db, "projects", projectNo);

      try {
        // Update the projectStatus in Firestore
        await updateDoc(projectDocRef, { projectStatus: newStatus });
      } catch (error) {
        console.error("Error updating status: ", error);
      } finally {
        setIsUpdating(false); // Stop the loading spinner
      }
    }
  };

  // Define the available statuses
  const statuses: string[] = [
    "Pending",
    "In Progress",
    "In Review",
    "Canceled",
    "Completed",
  ];

  // Function to handle status selection
  const handleStatusSelect = (newStatus: string) => {
    handleStatusChange(newStatus);
    setIsDropdownOpen(false); // Close the dropdown after selection
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <div
      className={`flex-auto ${
        isSidebarOpen ? "ml-64" : "ml-16"
      } mt-16 transition-all duration-300`}
    >
      <h1 className="text-2xl font-bold mb-4">Project Details</h1>

      {/* Show loading state after title */}
      {authLoading || !project ? (
        <div className="flex justify-center items-center h-screen">
          <div className={spin2}></div>
        </div>
      ) : (
        <>
          {/* Notification Message */}
          {showNotification && notification && (
            <div
              className={`fixed right-10 top-16 p-4 text-sm text-red-500 rounded-lg bg-red-50 font-normal border border-red-400 mt-2 transition-opacity duration-300`}
            >
              {notification}
            </div>
          )}

          {/* Header Section */}
          <div className="w-full bg-gray-100 px-6 py-4 flex justify-between items-center rounded-lg">
            {/* Left Column */}
            <div className="flex items-center space-x-8">
              {/* Project Name */}
              <h2 className="text-md font-semibold">
                {project?.name || "Project Name"}
              </h2>

              {/* Horizontal Navigation Menu */}
              <nav className="flex space-x-4">
                <button
                  className={`text-gray-700 hover:text-black ${
                    selectedTab === "overview" ? "font-bold" : ""
                  }`}
                  onClick={() => handleTabClick("overview")}
                >
                  Overview
                </button>
                <button
                  className={`text-gray-700 hover:text-black ${
                    selectedTab === "task" ? "font-bold" : ""
                  }`}
                  onClick={() => handleTabClick("task")}
                >
                  Task
                </button>
              </nav>
            </div>

            {/* Right Column */}
            <div className="flex items-center space-x-8">
              {/* Countdown Timer - Only show if status is not "Pending" */}
              {status !== "Pending" && (
                <div className="flex items-start justify-center w-full gap-4 count-down-main">
                  {["days", "hours", "mins", "sec"].map((unit, index) => (
                    <div className="timer w-8" key={index}>
                      <div className="bg-indigo-600 rounded-lg py-1 overflow-hidden">
                        <h3 className="countdown-element font-Cormorant font-semibold text-md text-white text-center">
                          {timeLeft[unit]}
                        </h3>
                      </div>
                      <p className="text-xs font-Cormorant font-normal text-gray-900 mt-1 text-center w-full">
                        {unit.charAt(0).toUpperCase() + unit.slice(1)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Updated Status Dropdown */}
              <div className="relative">
                <button
                  className={`${
                    status === "Pending"
                      ? "bg-gray-400"
                      : status === "In Progress"
                      ? "bg-green-400"
                      : status === "In Review"
                      ? "bg-yellow-400"
                      : status === "Completed"
                      ? "bg-green-600"
                      : status === "Canceled"
                      ? "bg-red-400"
                      : status === "Due Project"
                      ? "bg-red-600"
                      : "bg-gray-800" // Default color
                  } text-white px-4 py-2 rounded w-32 flex justify-center items-center`}
                  onClick={toggleDropdown} // Toggle dropdown on click
                >
                  {isUpdating ? <div className={spin}></div> : status}
                </button>
                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    {statuses.map((statusOption) => (
                      <button
                        key={statusOption}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                        onClick={() => handleStatusSelect(statusOption)}
                      >
                        {statusOption}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="mt-4">
            {selectedTab === "overview" ? (
              <Overview projectNo={projectNo} />
            ) : (
              <Task />
            )}
          </div>
        </>
      )}
    </div>
  );
}
