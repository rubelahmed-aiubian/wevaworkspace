//src/app/dashboard/teams/[teamCode]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { db } from "@/utils/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  arrayRemove,
} from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";
import { useSidebar } from "@/components/common/SidebarContext";
import Skeleton from "react-loading-skeleton";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2"; // Import SweetAlert
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiXCircle } from "react-icons/fi";
import Image from "next/image";

export default function TeamDetailPage() {
  const { isSidebarOpen } = useSidebar();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [emailCheck, setEmailCheck] = useState("");
  const [isAddingIndex, setIsAddingIndex] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const teamCode = pathname?.split("/")[3];
  const { user, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 6;

  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = selectedMembers.slice(
    indexOfFirstMember,
    indexOfLastMember
  );

  // Fetch team data based on updated structure
  useEffect(() => {
    const fetchTeam = async () => {
      if (teamCode) {
        try {
          const docRef = doc(db, "teams", teamCode);
          const teamDoc = await getDoc(docRef);
          if (teamDoc.exists()) {
            const teamData = teamDoc.data();
            const membersEmails = teamData.members || [];
            setTeam({ ...teamData, members: membersEmails });

            // Fetch member details based on emails
            const membersDetails = await Promise.all(
              membersEmails.map(async (email) => {
                const memberRef = doc(db, "members", email);
                const memberDoc = await getDoc(memberRef);
                return memberDoc.exists() ? memberDoc.data() : null;
              })
            );

            // Set selected members immediately after fetching
            const validMembers = membersDetails.filter(Boolean); // Filter out null values
            setSelectedMembers(validMembers); // Ensure valid members are set
          } else {
            router.push("/404");
          }
        } catch (error) {
          console.error("Error fetching team:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTeam();
  }, [teamCode, router, team]);

  // Search members by email or name
  useEffect(() => {
    const searchMembers = async () => {
      if (searchTerm.length > 3) {
        const membersRef = collection(db, "members");
        const q = query(
          membersRef,
          where("name", ">=", searchTerm),
          where("name", "<=", searchTerm + "\uf8ff")
        );
        const querySnapshot = await getDocs(q);
        const members = querySnapshot.docs.map((doc) => doc.data());
        setSearchResults(members);
      } else {
        setSearchResults([]);
      }
    };

    searchMembers();
  }, [searchTerm]);

  const addMemberToTeam = async (member, index) => {
    if (!user) {
      alert("You must be logged in to add members.");
      return;
    }

    const isAlreadyAdded = selectedMembers.some(
      (m) => m.email === member.email
    );
    if (isAlreadyAdded) {
      setEmailCheck("Already Added");
      return;
    }

    setIsAddingIndex(index);
    setEmailCheck("");

    try {
      const teamRef = doc(db, "teams", teamCode);
      await updateDoc(teamRef, {
        members: arrayUnion(member.email), // Only store email in the database
      });
      setSelectedMembers((prev) => [...prev, member]);
      setSearchTerm("");
    } catch (error) {
      console.error("Error adding member:", error);
    } finally {
      setIsAddingIndex(null);
    }
  };

  const toggleTeamStatus = async () => {
    if (!user) {
      alert("You must be logged in to change team status.");
      return;
    }

    setIsUpdatingStatus(true);

    try {
      const teamRef = doc(db, "teams", teamCode);
      const newStatus = team.teamStatus === "Active" ? "Disabled" : "Active";
      await updateDoc(teamRef, { teamStatus: newStatus });
      setTeam((prev) => ({ ...prev, teamStatus: newStatus }));
    } catch (error) {
      console.error("Error updating team status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const deleteTeam = async () => {
    const result = await Swal.fire({
      text: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete Team",
    });

    if (result.isConfirmed) {
      setIsDeleting(true);
      try {
        const teamRef = doc(db, "teams", teamCode);
        await deleteDoc(teamRef);
        Swal.fire("Deleted!", "Your team has been deleted.", "success");
        router.push("/dashboard/teams");
      } catch (error) {
        console.error("Error deleting team:", error);
        Swal.fire("Error!", "There was an error deleting the team.", "error");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const removeMember = async (email) => {
    const result = await Swal.fire({
      text: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Remove Member",
    });

    if (result.isConfirmed) {
      try {
        const teamRef = doc(db, "teams", teamCode);
        await updateDoc(teamRef, {
          members: arrayRemove(email), // Use arrayRemove to remove the email from the members array
        });
        setSelectedMembers((prev) =>
          prev.filter((member) => member.email !== email)
        );
        Swal.fire(
          "Removed!",
          "Member has been removed from the team.",
          "success"
        );
      } catch (error) {
        console.error("Error removing member:", error);
        Swal.fire("Error!", "There was an error removing the member.", "error");
      }
    }
  };

  return (
    <div
      className={`flex-auto ${
        isSidebarOpen ? "ml-64" : "ml-16"
      } mt-16 transition-all duration-300 overflow-hidden`}
    >
      <h1 className="text-2xl font-bold mb-4">Team Details</h1>
      {/* Skeleton Effect */}
      {loading || authLoading ? (
        <div className="flex">
          <div className="w-4/12 pr-4">
            <Skeleton height={40} count={6} className="mb-1" />
          </div>
          <div className="w-8/12">
            <Skeleton height={40} className="mb-4" />
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center border border-gray-200 rounded-lg p-4">
                <Skeleton circle height={100} width={100} />
                <Skeleton height={20} width={100} className="mt-2" />
                <Skeleton height={15} width={80} className="mt-1" />
              </div>
              <div className="flex flex-col items-center border border-gray-200 rounded-lg p-4">
                <Skeleton circle height={100} width={100} />
                <Skeleton height={20} width={100} className="mt-2" />
                <Skeleton height={15} width={80} className="mt-1" />
              </div>
              <div className="flex flex-col items-center border border-gray-200 rounded-lg p-4">
                <Skeleton circle height={100} width={100} />
                <Skeleton height={20} width={100} className="mt-2" />
                <Skeleton height={15} width={80} className="mt-1" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex space-x-6">
          {/* Team Details */}
          <div className="w-4/12 rounded-lg overflow-hidden border border-gray-300 bg-white">
            <table className="table-auto w-full overflow-hidden">
              <thead>
                <tr className="bg-gray-100">
                  <th colSpan={2} className="p-2 text-center text-lg font-bold">
                    {team.teamName || "No Name"}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="p-2 font-semibold">Team Code:</td>
                  <td className="p-2 ">{team.teamCode || "N/A"}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-2 font-semibold">Team Name:</td>
                  <td className="p-2 ">{team.teamName || "N/A"}</td>
                </tr>

                <tr>
                  <td className="p-2 font-semibold">Members:</td>
                  <td className="p-2">{selectedMembers.length} members</td>
                </tr>
                <tr>
                  <td colSpan={2} className="p-2 ">
                    <button
                      onClick={toggleTeamStatus}
                      className={`w-full rounded py-2 text-white flex justify-center items-center ${
                        team.teamStatus === "Active"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                      disabled={isUpdatingStatus}
                    >
                      {isUpdatingStatus ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        team.teamStatus || "Active"
                      )}
                    </button>
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="p-2 ">
                    <button
                      onClick={deleteTeam}
                      className="w-full bg-red-400 text-white py-2 rounded flex justify-center items-center" // Added flex properties
                      disabled={isDeleting} // Disable button while deleting
                    >
                      {isDeleting ? ( // Show spinner or button text
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        "Delete Team"
                      )}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="w-8/12">
            <div className="relative mb-4">
              <div className="flex w-full border-2 border-gray-900 rounded-md overflow-hidden">
                <button className="bg-gray-900 text-white px-4 py-2 w-1/4">
                  Add Member
                </button>
                <input
                  type="text"
                  placeholder="Search here..."
                  className="p-2 w-full outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Display search results */}
              {searchTerm.length > 3 && (
                <div className="absolute w-full bg-white border border-teal-500 mt-1 rounded-md shadow-lg z-10">
                  {searchResults.length > 0 ? (
                    searchResults.map((member, index) => (
                      <div
                        key={index}
                        onClick={() => addMemberToTeam(member, index)}
                        className="flex items-center p-2 cursor-pointer hover:bg-gray-200"
                      >
                        <Image
                          src={
                            member.photo
                              ? `/images/users/${member.photo}`
                              : "/images/users/user.png"
                          }
                          alt="Member Photo"
                          className="bg-gray-200 rounded-full h-10 w-10 flex-shrink-0 mr-2"
                        />
                        <div className="flex-grow">
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-sm text-gray-500">
                            {member.position}
                          </p>
                        </div>
                        <div className="ml-2 flex items-center">
                          {isAddingIndex === index ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-500"></div>
                          ) : emailCheck && member.email === emailCheck ? (
                            <span className="text-red-500">{emailCheck}</span>
                          ) : emailCheck &&
                            selectedMembers.some(
                              (m) => m.email === member.email
                            ) ? (
                            <span className="text-white text-sm bg-red-500 rounded-full px-3 py-1">
                              Added
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-center text-gray-500">
                      No members found
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {currentMembers.length > 0 ? (
                currentMembers.map((member, index) => (
                  <div
                    key={index}
                    className="text-center border rounded-lg p-4 mb-4 relative"
                  >
                    <Image
                      src={
                        member.photo
                          ? `/images/users/${member.email}/${member.photo}`
                          : "/images/users/user.png"
                      }
                      width={100}
                      height={100}
                      alt="Member Photo"
                      className="bg-gray-200 rounded-full h-24 w-24 mx-auto mb-2"
                    />
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-gray-500">{member.position}</p>

                    <FiXCircle
                      className="absolute top-2 right-2 cursor-pointer
                    text-gray-400 hover:text-red-500"
                      size={20}
                      aria-label="Remove member"
                      onClick={() => removeMember(member.email)}
                    />
                  </div>
                ))
              ) : (
                <p className="text-center">No members added yet!</p>
              )}
            </div>
            <div className="flex flex-col items-center mt-4">
              {selectedMembers.length > 0 ? (
                <>
                  <span className="text-sm text-gray-700 dark:text-gray-400">
                    Showing{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {indexOfFirstMember + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {Math.min(indexOfLastMember, selectedMembers.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {selectedMembers.length}
                    </span>{" "}
                    Members
                  </span>
                  {selectedMembers.length > membersPerPage && (
                    <div className="inline-flex mt-2 xs:mt-0">
                      {/* Prev Button */}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 rounded-l hover:bg-gray-900"
                      >
                        <FaChevronLeft
                          className="w-3.5 h-3.5 me-2"
                          aria-hidden="true"
                        />
                        Prev
                      </button>
                      {/* Next Button */}
                      <button
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={indexOfLastMember >= selectedMembers.length}
                        className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 border-0 border-l border-gray-700 rounded-r hover:bg-gray-900"
                      >
                        Next
                        <FaChevronRight
                          className="w-3.5 h-3.5 ms-2"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-center">
                  No members added yet!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
