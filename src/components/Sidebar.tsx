// src/components/Sidebar.tsx
import { useRouter } from 'next/navigation';
import {
  FaTachometerAlt,
  FaList,
  FaUsers,
  FaProjectDiagram,
  FaCog,
  FaBars,
  FaBell,
} from 'react-icons/fa';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const router = useRouter();
  
  const handleNavigation = (path) => {
    router.push(`/${path}`);
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-gray-800 text-white ${isOpen ? "w-64" : "w-16"} transition-all duration-300 flex flex-col`}
    >
      <div className={`flex items-center justify-between ${isOpen ? "p-4" : "p-5"} border-b border-gray-700`}>
        {isOpen && <img src="/images/logo.png" alt="Logo" className="w-10" />}
        <button onClick={toggleSidebar} className="text-xl">
          <FaBars />
        </button>
      </div>
      <nav className="flex-1 mt-4">
        <ul>
          <li
            className={`flex items-center p-4 hover:bg-gray-700 cursor-pointer ${
              isOpen && "text-white"
            }`}
          >
            <button
              onClick={() => handleNavigation('dashboard')}
              className={`flex items-center ${isOpen ? "hover:bg-gray-700" : ""} w-full text-left`}
            >
              <FaTachometerAlt className="mr-3" />
              {isOpen && "Dashboard"}
            </button>
          </li>
          <li
            className={`flex items-center p-4 hover:bg-gray-700 cursor-pointer ${
              isOpen && "text-white"
            }`}
          >
            <button
              onClick={() => handleNavigation('mylist')}
              className={`flex items-center ${isOpen ? "hover:bg-gray-700" : ""} w-full text-left`}
            >
              <FaList className="mr-3" />
              {isOpen && "My List"}
            </button>
          </li>
          <li
            className={`flex items-center p-4 hover:bg-gray-700 cursor-pointer ${
              isOpen && "text-white"
            }`}
          >
            <button
              onClick={() => handleNavigation('projects')}
              className={`flex items-center ${isOpen ? "hover:bg-gray-700" : ""} w-full text-left`}
            >
              <FaProjectDiagram className="mr-3" />
              {isOpen && "Projects"}
            </button>
          </li>
          <li
            className={`flex items-center p-4 hover:bg-gray-700 cursor-pointer ${
              isOpen && "text-white"
            }`}
          >
            <button
              onClick={() => handleNavigation('teams')}
              className={`flex items-center ${isOpen ? "hover:bg-gray-700" : ""} w-full text-left`}
            >
              <FaUsers className="mr-3" />
              {isOpen && "Teams"}
            </button>
          </li>
          <li
            className={`flex items-center p-4 hover:bg-gray-700 cursor-pointer ${
              isOpen && "text-white"
            }`}
          >
            <button
              onClick={() => handleNavigation('members')}
              className={`flex items-center ${isOpen ? "hover:bg-gray-700" : ""} w-full text-left`}
            >
              <FaUsers className="mr-3" />
              {isOpen && "Members"}
            </button>
          </li>
          <li
            className={`flex items-center p-4 hover:bg-gray-700 cursor-pointer ${
              isOpen && "text-white"
            }`}
          >
            <button
              onClick={() => handleNavigation('announcement')}
              className={`flex items-center ${isOpen ? "hover:bg-gray-700" : ""} w-full text-left`}
            >
              <FaBell className="mr-3" />
              {isOpen && "Announcement"}
            </button>
          </li>
        </ul>
      </nav>
      <div
        className={`p-4 border-t border-gray-700 mt-auto flex items-center justify-center hover:bg-gray-700 cursor-pointer ${
          isOpen && "text-white"
        }`}
      >
        <button
          onClick={() => handleNavigation('settings')}
          className={`flex items-center ${isOpen ? "hover:bg-gray-700" : ""} w-full text-left`}
        >
          <FaCog className="mr-2" />
          {isOpen && "Settings"}
        </button>
      </div>
    </div>
  );
}