import { useState } from "react";
import {
  FaTachometerAlt,
  FaList,
  FaUsers,
  FaProjectDiagram,
  FaCog,
  FaBars,
  FaBell,
} from "react-icons/fa";

const Sidebar = ({ isOpen, toggleSidebar, onComponentChange }) => {
  const [activeParent, setActiveParent] = useState("Dashboard");

  const handleMenuClick = (menu) => {
    setActiveParent(menu);
    onComponentChange(menu);
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-gray-800 text-white ${
        isOpen ? "w-64" : "w-16"
      } transition-all duration-300 flex flex-col`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {isOpen && <img src="/images/logo.png" alt="Logo" className="w-10 h-10" />}
        <button onClick={toggleSidebar} className="text-2xl">
          <FaBars />
        </button>
      </div>
      <nav className="flex-1 mt-4">
        <ul>
          <li
            className={`flex items-center p-4 hover:bg-gray-700 cursor-pointer ${
              activeParent === "Dashboard" && "bg-gray-700"
            }`}
            onClick={() => handleMenuClick("Dashboard")}
          >
            <FaTachometerAlt className="mr-3" />
            {isOpen && "Dashboard"}
          </li>
          <li
            className={`flex items-center p-4 hover:bg-gray-700 cursor-pointer ${
              activeParent === "MyList" && "bg-gray-700"
            }`}
            onClick={() => handleMenuClick("MyList")}
          >
            <FaList className="mr-3" />
            {isOpen && "My List"}
          </li>
          <li
            className={`flex items-center p-4 hover:bg-gray-700 cursor-pointer ${
              activeParent === "Projects" && "bg-gray-700"
            }`}
            onClick={() => handleMenuClick("Projects")}
          >
            <FaProjectDiagram className="mr-3" />
            {isOpen && "Projects"}
          </li>
          <li
            className={`flex items-center p-4 hover:bg-gray-700 cursor-pointer ${
              activeParent === "Teams" && "bg-gray-700"
            }`}
            onClick={() => handleMenuClick("Teams")}
          >
            <FaUsers className="mr-3" />
            {isOpen && "Teams"}
          </li>
          <li
            className={`flex items-center p-4 hover:bg-gray-700 cursor-pointer ${
              activeParent === "Members" && "bg-gray-700"
            }`}
            onClick={() => handleMenuClick("Members")}
          >
            <FaUsers className="mr-3" />
            {isOpen && "Members"}
          </li>
          <li
            className={`flex items-center p-4 hover:bg-gray-700 cursor-pointer ${
              activeParent === "Announcement" && "bg-gray-700"
            }`}
            onClick={() => handleMenuClick("Announcement")}
          >
            <FaBell className="mr-3" />
            {isOpen && "Announcement"}
          </li>
        </ul>
      </nav>
      <div
        className={`p-4 border-t border-gray-700 mt-auto flex items-center justify-center hover:bg-gray-700 cursor-pointer ${
          activeParent === "Settings" && "bg-gray-700"
        }`}
        onClick={() => handleMenuClick("Settings")}
      >
        <FaCog className="mr-2" />
        {isOpen && "Settings"}
      </div>
    </div>
  );
};

export default Sidebar;
