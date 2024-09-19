"use client";

import React, { useState, useEffect } from 'react';
import { FaFilter, FaChevronRight } from 'react-icons/fa';
import AddMember from './AddMember'; // Ensure the path is correct

export default function Members() {
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const membersPerPage = 20;

  // Dummy data
  const dummyMembers = [
    {
      photo: '/images/ryan.png',
      name: 'John Doe',
      email: 'john.doe@example.com',
      position: 'Developer',
    },
    {
      photo: '/images/ryan.png',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      position: 'Developer',
    },
  ];

  useEffect(() => {
    setMembers(dummyMembers);
  }, []);

  const paginateMembers = members
    .filter(member => filter === 'All' || member.position === filter)
    .slice(
      (currentPage - 1) * membersPerPage,
      currentPage * membersPerPage
    );

  const totalPages = Math.ceil(members.length / membersPerPage);

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded"
        >
          Add Member
        </button>
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <FaFilter />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="All">All</option>
              <option value="Project Manager">Project Manager</option>
              <option value="Developer">Developer</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="text-center font-bold border-b border-gray-300">
            <th className="p-2">Photo</th>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Position</th>
            <th className="p-2">Details</th>
          </tr>
        </thead>
        <tbody>
          {paginateMembers.map((member, index) => (
            <tr key={index} className="text-center">
              <td className="border-b border-gray-200 p-2">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover mx-auto"
                />
              </td>
              <td className="border-b border-gray-200 p-2">{member.name}</td>
              <td className="border-b border-gray-200 p-2">{member.email}</td>
              <td className="border-b border-gray-200 p-2">
                <div className="bg-gray-100 border border-gray-300 rounded-full px-4 py-2 mx-auto inline-block">
                  {member.position}
                </div>
              </td>
              <td className="border-b border-gray-200 p-2">
                <FaChevronRight className="cursor-pointer bg-teal-600 p-2 text-3xl text-white mx-auto" />
              </td>
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

      {isModalOpen && <AddMember onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}