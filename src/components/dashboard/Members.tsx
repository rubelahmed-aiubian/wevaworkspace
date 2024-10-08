"use client";

import React, { useState, useEffect } from "react";
import { FaFilter, FaChevronRight } from "react-icons/fa";
import AddMember from "./AddMember"; // Ensure the path is correct
import { db } from "@/utils/firebase"; // Ensure the path to your firebase.js is correct
import { collection, getDocs } from "firebase/firestore";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const membersPerPage = 10;

  // Function to fetch and set members
  const fetchMembers = async () => {
    setLoading(true);
    const membersCollection = collection(db, "members");
    const querySnapshot = await getDocs(membersCollection);

    const membersData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setMembers(membersData);
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const paginateMembers = members
    .filter((member) => filter === "All" || member.position === filter)
    .slice((currentPage - 1) * membersPerPage, currentPage * membersPerPage);

  const totalPages = Math.ceil(members.length / membersPerPage);

  // Refresh function
  const refreshMembers = async () => {
    await fetchMembers();
  };
  

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded"
          disabled={loading}
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
          <tr className="text-left font-bold border-b border-gray-300">
            <th className="p-2">Photo</th>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Position</th>
            <th className="p-2 text-center">Details</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="text-left">
                  <td className="border-t border-gray-200 p-2">
                    <Skeleton circle={true} height={40} width={40} />
                  </td>
                  <td className="border-t border-gray-200 p-2">
                    <Skeleton height={20} width={120} />
                  </td>
                  <td className="border-t border-gray-200 p-2">
                    <Skeleton height={20} width={180} />
                  </td>
                  <td className="border-t border-gray-200 p-2">
                    <Skeleton height={20} width={160} />
                  </td>
                  <td className="border-t border-gray-200 p-2">
                    <Skeleton height={20} width={30} />
                  </td>
                </tr>
              ))
            : paginateMembers.map((member, index) => (
                <tr key={index} className="text-left">
                  <td className="border-t border-gray-200 p-2">
                    <img
                      src={`/images/users/${
                        member.photo ? member.photo : "user.png"
                      }`}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="border-t border-gray-200 p-2">
                    {member.name}
                  </td>
                  <td className="border-t border-gray-200 p-2">
                    {member.email}
                  </td>
                  <td className="border-t border-gray-200 p-2">
                    <div className="bg-gray-100 border border-gray-300 rounded-full px-2 py-1 mx-auto inline-block text-sm">
                      {member.position}
                    </div>
                  </td>
                  <td className="border-t border-gray-200 p-2">
                    <FaChevronRight className="cursor-pointer bg-teal-600 p-2 text-3xl text-white mx-auto" />
                  </td>
                </tr>
              ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4 border-t border-gray-200 pt-2">
        <span>
          Showing {(currentPage - 1) * membersPerPage + 1} to{" "}
          {Math.min(currentPage * membersPerPage, members.length)} of{" "}
          {members.length} results
          
        </span>
        <div>
          <button
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            className="px-4 py-2 bg-gray-200 rounded mr-2"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            onClick={() =>
              currentPage < totalPages && setCurrentPage(currentPage + 1)
            }
            className="px-4 py-2 bg-gray-200 rounded"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {isModalOpen && (
        <AddMember
          onClose={() => setIsModalOpen(false)}
          onMemberAdded={refreshMembers}
        />
      )}
    </div>
  );
}
