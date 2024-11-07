"use client";

import React, { useState, useEffect } from "react";
import { FaFilter, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import AddMember from "./AddMember";
import { db } from "@/utils/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const membersPerPage = 10;
  const [updatingStatus, setUpdatingStatus] = useState({});

  // Function to fetch and set members
  const fetchMembers = async () => {
    setLoading(true);
    const membersCollection = collection(db, "members");
    const querySnapshot = await getDocs(membersCollection);

    const membersData = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((member) => member.position !== "Admin"); // Filter out Admins

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

  // Function to toggle member status and update in Firebase
  const toggleStatus = async (member) => {
    setUpdatingStatus((prev) => ({ ...prev, [member.email]: true }));
    const newStatus = member.status === "Active" ? "Pending" : "Active";
    const memberDocRef = doc(db, "members", member.email);

    // Update the status in Firebase
    await updateDoc(memberDocRef, { status: newStatus });

    // Update the status locally to avoid re-fetching
    setMembers((prevMembers) =>
      prevMembers.map((m) =>
        m.id === member.id ? { ...m, status: newStatus } : m
      )
    );

    setUpdatingStatus((prev) => ({ ...prev, [member.email]: false }));
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
              <option value="Employee">Employee</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-gray-300 bg-white">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th
                className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"
                style={{ width: "15%" }}
              >
                Photo
              </th>
              <th
                className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"
                style={{ width: "25%" }}
              >
                Name
              </th>
              <th
                className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"
                style={{ width: "30%" }}
              >
                Email
              </th>
              <th
                className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"
                style={{ width: "15%" }}
              >
                Position
              </th>
              <th
                className="p-5 text-center text-sm leading-6 font-semibold text-gray-900 capitalize"
                style={{ width: "15%" }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index} className="odd:bg-white even:bg-gray-50">
                  <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    <Skeleton circle={true} height={40} width={40} />
                  </td>
                  <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    <Skeleton height={20} width={120} />
                  </td>
                  <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    <Skeleton height={20} width={180} />
                  </td>
                  <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    <Skeleton height={20} width={160} />
                  </td>
                  <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900 text-center">
                    <Skeleton height={20} width={30} />
                  </td>
                </tr>
              ))
            ) : paginateMembers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  No members found!
                </td>
              </tr>
            ) : (
              paginateMembers.map((member, index) => (
                <tr
                  key={index}
                  className="odd:bg-white even:bg-gray-50 text-left"
                >
                  <td className="p-4 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    <img
                      src={`/images/users/${
                        member.photo
                          ? `${member.email}/${member.photo}`
                          : "user.png"
                      }`}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    {member.name}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    {member.email}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    <div className="bg-gray-100 border border-gray-300 rounded-full px-2 py-1 mx-auto inline-block text-sm">
                      {member.position}
                    </div>
                  </td>
                  <td className="p-4 whitespace-normal text-sm leading-6 font-medium text-gray-900 text-center">
                    <button
                      onClick={() => toggleStatus(member)}
                      className={`w-full px-4 py-2 text-white font-semibold rounded ${
                        member.status === "Active"
                          ? "bg-green-500"
                          : "bg-red-400"
                      }`}
                      disabled={updatingStatus[member.id] || false}
                    >
                      {updatingStatus[member.email] ? (
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        </div>
                      ) : (
                        member.status
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col items-center mt-4">
        <span className="text-sm text-gray-700 dark:text-gray-400">
          Showing {(currentPage - 1) * membersPerPage + 1} to{" "}
          {Math.min(currentPage * membersPerPage, members.length)} of{" "}
          {members.length} members
        </span>
        <div className="inline-flex mt-2 xs:mt-0">
          {totalPages > 1 && (
            <>
              <button
                onClick={() =>
                  currentPage > 1 && setCurrentPage(currentPage - 1)
                }
                className="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900"
                disabled={currentPage === 1}
              >
                <FaChevronLeft className="me-2" /> Prev
              </button>
              <button
                onClick={() =>
                  currentPage < totalPages && setCurrentPage(currentPage + 1)
                }
                className="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-gray-800 border-0 border-s border-gray-700 rounded-e hover:bg-gray-900"
                disabled={currentPage === totalPages}
              >
                Next <FaChevronRight className="ms-2" />
              </button>
            </>
          )}
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
