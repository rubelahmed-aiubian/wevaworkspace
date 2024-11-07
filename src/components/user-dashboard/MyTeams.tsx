"use client";
import { db } from "@/utils/firebase";
import { useRouter } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export default function MyTeams() {
  const { userData } = useAuth();
  const [teams, setTeams] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const teamsPerPage = 10;
  const router = useRouter();
  console.log("teams", teams);

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

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const teamsCollection = collection(db, "teams");
      const querySnapshot = await getDocs(teamsCollection);

      const teamsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const team = { id: doc.id, ...doc.data() };

          const isMember =
            team.members && team.members.includes(userData.email);

          if (isMember) {
            try {
              team.teamLeaderInfo = await fetchTeamLeaderDetails(
                team.teamLeader
              );
            } catch (error) {
              console.error(
                `Error fetching leader details for team ${team.id}:`,
                error
              );
              team.teamLeaderInfo = null;
            }
            return team;
          }
          return null;
        })
      );
      setTeams(teamsData.filter((team) => team !== null));
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Pagination and filtering logic
  const paginateTeams = teams.slice(
    (currentPage - 1) * teamsPerPage,
    currentPage * teamsPerPage
  );

  const totalPages = Math.ceil(teams.length / teamsPerPage);

  return (
    <div className="p-4">
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
                    router.push(`/user-dashboard/myteams/${team.teamCode}`)
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
                      className={`w-full rounded py-2 text-white flex justify-center items-center ${
                        team.teamStatus === "Active"
                          ? "bg-green-500"
                          : "bg-red-400"
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
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col items-center mt-4">
        {/* Help text */}
        <span className="text-sm text-gray-700 dark:text-gray-400">
          Showing {(currentPage - 1) * teamsPerPage + 1} to{" "}
          {Math.min(currentPage * teamsPerPage, teams.length)} of {teams.length}{" "}
          teams
        </span>
        <div className="inline-flex mt-2 xs:mt-0">
          {/* Buttons */}
          {teams.length > teamsPerPage && ( // Check if teams exceed the limit
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
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
