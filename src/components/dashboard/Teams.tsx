//src/components/dashboard/Teams.tsx
"use client";

import { db } from "@/utils/firebase";
import { FaFilter } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import React, { useState, useEffect } from "react";
import AddTeam from "@/components/dashboard/AddTeam";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const teamsPerPage = 10;

  // Function to fetch and set teams
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const teamsCollection = collection(db, "teams");
      const querySnapshot = await getDocs(teamsCollection);
      const teamsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTeams(teamsData);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle team status
  const toggleTeamStatus = async (teamId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Disabled" ? "Active" : "Disabled";
    try {
      // Update the status locally
      setTeams((prevTeams) =>
        prevTeams.map((team) =>
          team.id === teamId ? { ...team, teamStatus: newStatus } : team
        )
      );
      // Update the status in the database
      const teamDocRef = doc(db, "teams", teamId);
      await updateDoc(teamDocRef, { teamStatus: newStatus });
    } catch (error) {
      console.error("Error updating team status:", error);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Pagination and filtering logic
  const filteredTeams = teams.filter(
    (team) => filter === "All" || team.teamStatus === filter
  );
  const paginateTeams = filteredTeams.slice(
    (currentPage - 1) * teamsPerPage,
    currentPage * teamsPerPage
  );

  const totalPages = Math.ceil(filteredTeams.length / teamsPerPage);

  // Refresh function
  const refreshTeams = async () => {
    await fetchTeams();
  };

  const router = useRouter();

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Add Team
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
              <option value="Active">Active</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left font-bold border-b border-gray-300">
            <th className="p-2" style={{ width: "15%" }}>
              Team Code
            </th>
            <th className="p-2" style={{ width: "25%" }}>
              Team Name
            </th>
            <th className="p-2" style={{ width: "25%" }}>
              Team Leader
            </th>
            <th className="p-2" style={{ width: "20%" }}>
              Team Members
            </th>
            <th className="p-2 text-center" style={{ width: "15%" }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="text-left">
                <td className="border-t border-gray-200 p-2">
                  <Skeleton height={20} width={40} />
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
                <td className="border-t border-gray-200 p-2 text-center">
                  <Skeleton height={20} width={30} />
                </td>
              </tr>
            ))
          ) : paginateTeams.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center p-4">
                No teams created yet!
              </td>
            </tr>
          ) : (
            paginateTeams.map((team, index) => (
              <tr
                key={index}
                className="text-left cursor-pointer hover:bg-gray-100"
                onClick={() => router.push(`/dashboard/teams/${team.teamCode}`)}
              >
                <td className="border-t border-gray-200 p-2">
                  {team.teamCode}
                </td>
                <td className="border-t border-gray-200 p-2">
                  {team.teamName}
                </td>
                <td className="border-t border-gray-200 p-2">
                  {team.teamLeader}
                </td>
                <td className="border-t border-gray-200 p-2">
                  {team.members ? team.members.length : 0} members
                </td>
                <td className="border-t border-gray-200 p-2 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTeamStatus(team.id, team.teamStatus);
                    }}
                    className={`rounded-full px-4 py-1 text-white ${
                      team.teamStatus === "Active"
                        ? "bg-green-500"
                        : "bg-gray-500"
                    }`}
                  >
                    {team.teamStatus}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4 border-t border-gray-200 pt-2">
        <span>
          Showing {(currentPage - 1) * teamsPerPage + 1} to{" "}
          {Math.min(currentPage * teamsPerPage, filteredTeams.length)} of{" "}
          {filteredTeams.length} results
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
        <AddTeam
          onClose={() => setIsModalOpen(false)}
          onTeamAdded={refreshTeams}
        />
      )}
    </div>
  );
}
