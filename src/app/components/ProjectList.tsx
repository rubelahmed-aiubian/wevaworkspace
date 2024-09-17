import React, { useState, useEffect } from 'react';
import { FaFilter, FaSort } from 'react-icons/fa';
import Link from 'next/link';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('Draft');
  const [sort, setSort] = useState('Newest');
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 20;

  // Dummy data
  const dummyProjects = [
    {
      name: 'Project Alpha',
      projectManager: 'John Doe',
      team: 'Team A',
      date: '2024-09-12',
      status: 'On Going',
    },
    {
      name: 'Project Beta',
      projectManager: 'Jane Smith',
      team: 'Team B',
      date: '2024-08-25',
      status: 'Completed',
    },
    {
      name: 'Project Gamma',
      projectManager: 'Ryan Howard',
      team: 'Team C',
      date: '2024-09-05',
      status: 'Pending',
    },
    {
      name: 'Project Delta',
      projectManager: 'John Doe',
      team: 'Team A',
      date: '2024-07-30',
      status: 'Draft',
    },
    {
      name: 'Project Epsilon',
      projectManager: 'Jane Smith',
      team: 'Team B',
      date: '2024-09-10',
      status: 'On Going',
    },
  ];

  useEffect(() => {
    // Simulate fetching projects from local storage or an API
    setProjects(dummyProjects);
  }, []);

  const paginateProjects = projects
    .filter(project => filter === 'On Going' || project.status === filter)
    .sort((a, b) => (sort === 'Newest' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)))
    .slice(
      (currentPage - 1) * projectsPerPage,
      currentPage * projectsPerPage
    );

  const totalPages = Math.ceil(projects.length / projectsPerPage);

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <Link href="/add-project">
          <button className="bg-gray-900 text-white px-4 py-2 rounded">Add New Project</button>
        </Link>
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <FaFilter />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="Draft">Draft</option>
              <option value="Pending">Pending</option>
              <option value="On Going">On Going</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr>
            <th className="border border-gray-300 font-normal p-2 relative">
              Project Name
              <FaSort className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 hover:opacity-100 cursor-pointer" />
            </th>
            <th className="border border-gray-300 font-normal p-2">Project Manager</th>
            <th className="border border-gray-300 font-normal p-2">Team</th>
            <th className="border border-gray-300 font-normal p-2">Due Date</th>
            <th className="border border-gray-300 font-normal p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {paginateProjects.map((project, index) => (
            <tr key={index} className="h-12">
              <td className="border border-gray-200 p-2">{project.name}</td>
              <td className="border border-gray-200 p-2 text-center">{project.projectManager}</td>
              <td className="border border-gray-200 p-2 text-center">{project.team}</td>
              <td className="border border-gray-200 p-2 text-center">
                {new Date(project.date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                })}
              </td>
              <td className="border border-gray-200 p-2 text-center">{project.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-center items-center mt-4">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-4 py-2 mx-1 rounded ${
              currentPage === i + 1 ? 'bg-gray-700 text-white' : 'bg-gray-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
