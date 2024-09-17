"use client";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import MyList from "../components/MyList";
import ProjectList from "../components/ProjectList";
import DashboardContent from "../components/DashboardContent";
import Team from "../components/Teams";
import Members from "../components/Members";
import Announcement from "../components/Announcement";
import Settings from "../components/Settings";

export default function DashboardPage() {
  const [selectedComponent, setSelectedComponent] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (selectedComponent) {
      case "Dashboard":
        return <DashboardContent />;
      case "MyList":
        return <MyList />;
      case "Projects":
        return <ProjectList />;
      case "Teams":
        return <Team />;
      case "Members":
        return <Members />;
      case "Announcement":
        return <Announcement />;
      case "Settings":
        return <Settings />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onComponentChange={(component) => setSelectedComponent(component)}
      />
      <div className={`flex-auto ${isSidebarOpen ? "ml-64" : "ml-16"} mt-16`}>
        <Header isOpen={isSidebarOpen} />
        <div className="p-6 flex-1 overflow-auto">{renderContent()}</div>
      </div>
    </div>
  );
}
