import { useState } from 'react';
import { FaTachometerAlt, FaList, FaUsers, FaProjectDiagram, FaCog, FaBars, FaChevronDown } from 'react-icons/fa';

const Sidebar = ({ isOpen, toggleSidebar, onComponentChange }) => {
  const [activeParent, setActiveParent] = useState(''); // State to track the active parent
  const [activeSubMenu, setActiveSubMenu] = useState(''); // State to track the active sub-menu

  const handleParentClick = (parent) => {
    // Toggle the parent menu when clicking the arrow, and close it if clicked again
    setActiveParent((prevParent) => (prevParent === parent ? '' : parent));
  };

  const handleSubMenuClick = (subMenu, parent) => {
    setActiveSubMenu(subMenu);
    onComponentChange(subMenu); // Change the dashboard content
    setActiveParent(parent); // Ensure the parent remains open when a sub-menu is clicked
  };

  const isParentActive = (parent) => activeParent === parent;
  const isSubMenuActive = (subMenu) => activeSubMenu === subMenu;

  return (
    <div className={`fixed top-0 left-0 h-full bg-gray-800 text-white ${isOpen ? 'w-64' : 'w-16'} transition-all duration-300 flex flex-col`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {isOpen && <img src="/images/logo.png" alt="Logo" className="w-10 h-10" />}
        <button onClick={toggleSidebar} className="text-2xl">
          <FaBars />
        </button>
      </div>
      <nav className="flex-1 mt-4">
        <ul>
          {/* Dashboard */}
          <li
            className={`flex items-center p-4 hover:bg-gray-700 cursor-pointer ${
              activeParent === 'Dashboard' && 'bg-gray-700'
            }`}
            onClick={() => {
              onComponentChange('Dashboard');
              setActiveParent('Dashboard');
            }}
          >
            <FaTachometerAlt className="mr-3" />
            {isOpen && 'Dashboard'}
          </li>

          {/* My List */}
          <li
            className={`flex items-center p-4 hover:bg-gray-700 cursor-pointer ${
              activeParent === 'My List' && 'bg-gray-700'
            }`}
            onClick={() => {
              onComponentChange('My List');
              setActiveParent('My List');
            }}
          >
            <FaList className="mr-3" />
            {isOpen && 'My List'}
          </li>

          {/* Projects */}
          <li className="cursor-pointer">
            <div
              className={`flex items-center p-4 hover:bg-gray-700 ${
                isParentActive('Projects') && 'bg-gray-700'
              }`}
              onClick={() => handleParentClick('Projects')}
            >
              <FaProjectDiagram className="mr-3" />
              {isOpen && <span className="flex-1">Projects</span>}
              {isOpen && <FaChevronDown className={`ml-auto ${isParentActive('Projects') ? 'rotate-180' : ''} transition-transform`} />}
            </div>
            {isOpen && isParentActive('Projects') && (
              <ul className="pl-8 bg-gray-700">
                <li
                  className={`py-2 hover:bg-gray-700 hover:text-red-500 ${
                    isSubMenuActive('Project List') && 'text-red-500'
                  }`}
                  onClick={() => handleSubMenuClick('Project List', 'Projects')}
                >
                  Project List
                </li>
                <li
                  className={`py-2 hover:bg-gray-700 hover:text-red-500 ${
                    isSubMenuActive('Add Project') && 'text-red-500'
                  }`}
                  onClick={() => handleSubMenuClick('Add Project', 'Projects')}
                >
                  Add Project
                </li>
              </ul>
            )}
          </li>

          {/* Teams */}
          <li className="cursor-pointer">
            <div
              className={`flex items-center p-4 hover:bg-gray-700 ${
                isParentActive('Teams') && 'bg-gray-700'
              }`}
              onClick={() => handleParentClick('Teams')}
            >
              <FaUsers className="mr-3" />
              {isOpen && <span className="flex-1">Teams</span>}
              {isOpen && <FaChevronDown className={`ml-auto ${isParentActive('Teams') ? 'rotate-180' : ''} transition-transform`} />}
            </div>
            {isOpen && isParentActive('Teams') && (
              <ul className="pl-8 bg-gray-700">
                <li
                  className={`py-2 hover:bg-gray-700 hover:text-red-500 ${
                    isSubMenuActive('All Teams') && 'text-red-500'
                  }`}
                  onClick={() => handleSubMenuClick('All Teams', 'Teams')}
                >
                  All Teams
                </li>
                <li
                  className={`py-2 hover:bg-gray-700 hover:text-red-500 ${
                    isSubMenuActive('New Team') && 'text-red-500'
                  }`}
                  onClick={() => handleSubMenuClick('New Team', 'Teams')}
                >
                  New Team
                </li>
              </ul>
            )}
          </li>

          {/* Members */}
          <li className="cursor-pointer">
            <div
              className={`flex items-center p-4 hover:bg-gray-700 ${
                isParentActive('Members') && 'bg-gray-700'
              }`}
              onClick={() => handleParentClick('Members')}
            >
              <FaUsers className="mr-3" />
              {isOpen && <span className="flex-1">Members</span>}
              {isOpen && <FaChevronDown className={`ml-auto ${isParentActive('Members') ? 'rotate-180' : ''} transition-transform`} />}
            </div>
            {isOpen && isParentActive('Members') && (
              <ul className="pl-8 bg-gray-700">
                <li
                  className={`py-2 hover:bg-gray-700 hover:text-red-500 ${
                    isSubMenuActive('All Members') && 'text-red-500'
                  }`}
                  onClick={() => handleSubMenuClick('All Members', 'Members')}
                >
                  All Members
                </li>
                <li
                  className={`py-2 hover:bg-gray-700 hover:text-red-500 ${
                    isSubMenuActive('Add Member') && 'text-red-500'
                  }`}
                  onClick={() => handleSubMenuClick('Add Member', 'Members')}
                >
                  Add Member
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {/* Settings at the bottom */}
      <div
        className={`p-4 border-t border-gray-700 mt-auto flex items-center justify-center hover:bg-gray-700 cursor-pointer ${
          activeParent === 'Settings' && 'bg-gray-700'
        }`}
        onClick={() => {
          onComponentChange('Settings');
          setActiveParent('Settings');
        }}
      >
        <FaCog className="mr-2" />
        {isOpen && 'Settings'}
      </div>
    </div>
  );
};

export default Sidebar;
