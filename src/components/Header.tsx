"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { FaSearch, FaBell, FaChevronDown } from "react-icons/fa";

export default function Header() {
  const router = useRouter();
  const { isSidebarOpen } = useSidebar();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleProfileClick = () => {
    router.push("/profile");
    closeMenu();
  };

  return (
    <div
      className={`fixed top-0 right-0 h-16 bg-white shadow-md flex justify-between items-center px-4 transition-all duration-300`}
      style={{
        width: isSidebarOpen ? "calc(100% - 16rem)" : "calc(100% - 4rem)",
        marginLeft: isSidebarOpen ? "16rem" : "4rem",
      }}
    >
      <div className="relative w-full max-w-md">
        <FaSearch className="absolute top-1 left-3 text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 bg-transparent border-none focus:outline-none text-gray-700"
        />
      </div>

      <div className="flex items-center space-x-6">
        <FaBell className="text-gray-600 text-lg cursor-pointer" />

        <div className="relative">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={toggleMenu}
          >
            <img
              src="/images/ryan.png"
              alt="User"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-gray-700 font-semibold">Ryan</span>
            <FaChevronDown className="text-gray-600" />
          </div>

          {isMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md z-50"
              onClick={closeMenu}
            >
              <ul className="py-2">
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={handleProfileClick}
                >
                  Profile
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Log Out
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      {isMenuOpen && <div className="fixed inset-0" onClick={closeMenu}></div>}
    </div>
  );
}
