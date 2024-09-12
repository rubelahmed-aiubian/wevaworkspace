"use client";

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import DashboardContent from '../components/DashboardContent';

export default function Dashboard() {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState("Dashboard");

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleComponentChange = (componentName) => {
    setSelectedComponent(componentName);
  };

  return (
    <div className="flex">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} onComponentChange={handleComponentChange} />
      <div className={`flex-1 ${isOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        <Header isOpen={isOpen} />
        <DashboardContent selectedComponent={selectedComponent} />
      </div>
    </div>
  );
}
