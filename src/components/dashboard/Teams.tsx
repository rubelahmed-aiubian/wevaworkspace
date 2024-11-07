//src/components/dashboard/Teams.tsx
"use client";

import { db } from "@/utils/firebase";
import { FaFilter } from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import React, { useState, useEffect } from "react";
import AddTeam from "@/components/dashboard/AddTeam";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const teamsPerPage = 10;
  const [updatingStatus, setUpdatingStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const router = useRouter();
  const pathname = usePathname();

  // Function to fetch team leader details
  const fetchTeamLeaderDetails = async (teamLeaderId: string) => {
    if (teamLeaderId) {
      const leaderDocRef = doc(db, "members", teamLeaderId);
      const leaderSnap = await getDoc(leaderDocRef);
      return leaderSnap.exists()
        ? { id: leaderSnap.id, ...leaderSnap.data() }
        : null;
    }
    return null; // Return null if no team leader ID
  };

  //Fetch team details
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const teamsCollection = collection(db, "teams");
      const querySnapshot = await getDocs(teamsCollection);

      const teamsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const team = { id: doc.id, ...doc.data() };
          // Fetching team leader data using the helper function
          team.teamLeaderInfo = await fetchTeamLeaderDetails(team.teamLeader);
          return team;
        })
      );

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
      setUpdatingStatus((prev) => ({ ...prev, [teamId]: true })); // Set loading state for specific team
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
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [teamId]: false })); // Reset loading state for specific team
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Open the modal and update the URL to show `/add-project`
  const handleOpenModal = () => {
    setIsModalOpen(true);
    // Change URL to include `?modal=add-project` to track modal state
    router.push(`${pathname}?modal=add-team`, undefined, { shallow: true });
  };

  // Close the modal and revert the URL back to the current project list page
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Revert the URL back to the original path without query params
    router.push(pathname, undefined, { shallow: true });
  };

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

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <button
          onClick={handleOpenModal}
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

      <div className="rounded-lg overflow-hidden border border-gray-300 bg-white">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th
                scope="col"
                className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"
                style={{ width: "20%" }}
              >
                Team Code
              </th>
              <th
                scope="col"
                className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"
                style={{ width: "20%" }}
              >
                Team Name
              </th>
              <th
                scope="col"
                className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"
                style={{ width: "25%" }}
              >
                Team Leader
              </th>
              <th
                scope="col"
                className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"
                style={{ width: "20%" }}
              >
                Team Members
              </th>
              <th
                scope="col"
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
                  <td
                    className="p-5 whitespace-normal text-sm leading-6 font-medium text-gray-900"
                    style={{ width: "100px" }} // Set fixed width
                  >
                    <Skeleton height={20} width={40} />
                  </td>
                  <td
                    className="p-5 whitespace-normal text-sm leading-6 font-medium text-gray-900"
                    style={{ width: "150px" }} // Set fixed width
                  >
                    <Skeleton height={20} width={120} />
                  </td>
                  <td
                    className="p-5 whitespace-normal text-sm leading-6 font-medium text-gray-900"
                    style={{ width: "200px" }} // Set fixed width
                  >
                    <div className="inline-flex items-center rounded-full px-2 py-1 bg-gray-200">
                      <Skeleton
                        circle={true}
                        height={40}
                        width={40}
                        className="mr-2"
                      />
                      <div className="pr-2">
                        <Skeleton height={20} width={80} />
                        <Skeleton height={15} width={60} />
                      </div>
                    </div>
                  </td>
                  <td
                    className="p-5 whitespace-normal text-sm leading-6 font-medium text-gray-900"
                    style={{ width: "150px" }} // Set fixed width
                  >
                    <Skeleton height={20} width={160} />
                  </td>
                  <td
                    className="p-5 whitespace-normal text-sm leading-6 font-medium text-gray-900 text-center"
                    style={{ width: "100px" }} // Set fixed width
                  >
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
                  className="odd:bg-white even:bg-gray-50 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() =>
                    router.push(`/dashboard/teams/${team.teamCode}`)
                  }
                >
                  <td
                    className="p-4 whitespace-normal text-sm leading-6 font-medium text-gray-900"
                    style={{ width: "100px" }} // Set fixed width
                  >
                    {team.teamCode}
                  </td>
                  <td
                    className="p-4 whitespace-normal text-sm leading-6 font-medium text-gray-900"
                    style={{ width: "150px" }} // Set fixed width
                  >
                    {team.teamName}
                  </td>
                  <td
                    className="p-4"
                    style={{ width: "200px" }} // Set fixed width
                  >
                    <div className="inline-flex items-center rounded-full px-2 py-1 bg-gray-200">
                      {team.teamLeaderInfo &&
                      Object.keys(team.teamLeaderInfo).length > 0 ? (
                        <>
                          <img
                            src={
                              team.teamLeaderInfo.photo
                                ? `/images/users/${team.teamLeaderInfo.email}/${team.teamLeaderInfo.photo}`
                                : "/images/users/user.png" // Default photo if no photo found
                            }
                            alt="Team Leader"
                            className="rounded-full w-10 h-10 mr-2"
                          />
                          <div className="pr-2">
                            <div className="text-sm font-semibold">
                              {team.teamLeaderInfo.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {team.teamLeaderInfo.position}
                            </div>
                          </div>
                        </>
                      ) : (
                        <span>No Leader</span> // Fallback if no leader info
                      )}
                    </div>
                  </td>
                  <td
                    className="p-4 whitespace-normal text-sm leading-6 font-medium text-gray-900"
                    style={{ width: "150px" }} // Set fixed width
                  >
                    {team.members ? team.members.length : 0} Members
                  </td>
                  <td
                    className="p-4 whitespace-normal text-sm leading-6 font-medium text-gray-900 text-center"
                    style={{ width: "100px" }} // Set fixed width
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTeamStatus(team.id, team.teamStatus);
                      }}
                      className={`w-full rounded py-2 text-white flex justify-center items-center ${
                        team.teamStatus === "Active"
                          ? "bg-green-500"
                          : "bg-red-400"
                      }`}
                      disabled={updatingStatus[team.id] || false}
                    >
                      {updatingStatus[team.id] ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        team.teamStatus
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
        {/* Help text */}
        <span className="text-sm text-gray-700 dark:text-gray-400">
          Showing {(currentPage - 1) * teamsPerPage + 1} to{" "}
          {Math.min(currentPage * teamsPerPage, filteredTeams.length)} of{" "}
          {filteredTeams.length} teams
        </span>
        <div className="inline-flex mt-2 xs:mt-0">
          {/* Buttons */}
          {filteredTeams.length > teamsPerPage && ( // Check if teams exceed the limit
            <>
              <button
                onClick={() =>
                  currentPage > 1 && setCurrentPage(currentPage - 1)
                }
                className="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900"
                disabled={currentPage === 1}
              >
                <FaChevronLeft className="me-2" /> {/* Use left chevron icon */}
                Prev
              </button>
              <button
                onClick={() =>
                  currentPage < totalPages && setCurrentPage(currentPage + 1)
                }
                className="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-gray-800 border-0 border-s border-gray-700 rounded-e hover:bg-gray-900"
                disabled={currentPage === totalPages}
              >
                Next
                <FaChevronRight className="ms-2" />{" "}
                {/* Use right chevron icon */}
              </button>
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <AddTeam onClose={handleCloseModal} onTeamAdded={refreshTeams} />
      )}
    </div>
  );
}
