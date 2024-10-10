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
} from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";
import { useSidebar } from "@/components/common/SidebarContext";
import Skeleton from "react-loading-skeleton";
import { useAuth } from "@/context/AuthContext";

export default function TeamDetailPage() {
  const { isSidebarOpen } = useSidebar();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [emailCheck, setEmailCheck] = useState(""); // State for email check message
  const [isAdding, setIsAdding] = useState(false); // State for loading spinner
  const [isAddingIndex, setIsAddingIndex] = useState(null); // State for tracking the index of the member being added
  const router = useRouter();
  const pathname = usePathname();
  const teamCode = pathname?.split("/")[3];
  const { user, userData, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchTeam = async () => {
      if (teamCode) {
        try {
          const docRef = doc(db, "teams", teamCode);
          const teamDoc = await getDoc(docRef);
          if (teamDoc.exists()) {
            setTeam(teamDoc.data());
            setSelectedMembers(teamDoc.data().members || []);
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
  }, [teamCode, router]);

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
        const members = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            name: data.name,
            position: data.position,
            email: data.email,
            photoURL: data.photo || "",
          };
        });
        setSearchResults(members);
        setEmailCheck(""); // Reset email check message
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

    // Check if the member is already added
    const isAlreadyAdded = selectedMembers.some(
      (m) => m.email === member.email
    );
    if (isAlreadyAdded) {
      setEmailCheck("Already Added"); // Show message if member is already added
      return;
    }

    setIsAddingIndex(index); // Set the index of the member being added
    setEmailCheck(""); // Reset the message

    try {
      const teamRef = doc(db, "teams", teamCode);
      const memberData = {
        name: member.name,
        photoURL: member.photoURL || "",
        position: member.position || "",
        email: member.email,
      };
      await updateDoc(teamRef, {
        members: arrayUnion(memberData),
      });
      setSelectedMembers((prev) => [...prev, memberData]);
      setSearchTerm(""); // Clear the search input
    } catch (error) {
      console.error("Error adding member:", error);
    } finally {
      setIsAddingIndex(null); // Reset the index after adding is complete
    }
  };

  if (loading || authLoading) {
    return (
      <div
        className={`flex ${
          isSidebarOpen ? "ml-64" : "ml-16"
        } mt-16 transition-all duration-300`}
      >
        <div className="w-1/2 pr-4">
          <Skeleton height={30} count={5} />
        </div>
        <div className="w-1/2">
          <Skeleton height={30} count={5} />
        </div>
      </div>
    );
  }

  if (!team) {
    return <div>Team not found</div>;
  }

  return (
    <div
      className={`flex-auto ${
        isSidebarOpen ? "ml-64" : "ml-16"
      } mt-16 transition-all duration-300`}
    >
      <h1 className="text-2xl font-bold mb-4">Team Details</h1>
      <div className="flex space-x-6">
        <div className="w-4/12">
          <table className="table-auto w-full border border-gray-400 overflow-hidden border-collapse">
            <thead className="bg-teal-500 text-white">
              <tr>
                <th
                  colSpan={2}
                  className="p-3 text-center text-lg font-bold border border-gray-400"
                >
                  {team.teamName || "No Name"}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 font-semibold border border-gray-400">
                  Team Code
                </td>
                <td className="p-2 border border-gray-400">
                  {team.teamCode || "N/A"}
                </td>
              </tr>
              <tr>
                <td className="p-2 font-semibold border border-gray-400">
                  Team Leader
                </td>
                <td className="p-2 border border-gray-400">
                  {team.teamLeader || "N/A"}
                </td>
              </tr>
              <tr>
                <td className="p-2 font-semibold border border-gray-400">
                  Members
                </td>
                <td className="p-2 border border-gray-400">
                  {selectedMembers.length} members
                </td>
              </tr>
              <tr>
                <td colSpan={2} className="p-2 border border-gray-400">
                  <button className="w-full bg-green-500 text-white py-2 rounded">
                    {team.teamStatus || "Active"}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="w-8/12">
          <div className="relative mb-4">
            <div className="flex w-full border-2 border-teal-500 rounded-md overflow-hidden">
              <button className="bg-teal-500 text-white px-4 py-2 w-1/4">
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
                      onClick={() => addMemberToTeam(member, index)} // Pass the index here
                      className="flex items-center p-2 cursor-pointer hover:bg-gray-200"
                    >
                      <img
                        src={
                          member.photoURL
                            ? `/images/users/${member.photoURL}`
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
                      {/* Show spinner or email check message on the right */}
                      <div className="ml-2 flex items-center">
                        {isAddingIndex === index ? ( // Show spinner only for the selected row in search results
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-500"></div>
                        ) : emailCheck && member.email === emailCheck ? (
                          <span className="text-red-500">{emailCheck}</span>
                        ) : emailCheck && selectedMembers.some(m => m.email === member.email) ? (
                          <span className="text-white text-sm bg-red-500 rounded-full px-3 py-1">Added</span> // Show message if member is already added
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
          {/* Members List */}
          <div className="grid grid-cols-3 gap-4"> {/* Changed to grid layout */}
            {selectedMembers.length > 0 ? (
              selectedMembers.map((member, index) => (
                <div
                  key={index}
                  className="text-center border rounded-lg p-4 mb-4"
                >
                  <img
                    src={
                      member.photoURL
                        ? `/images/users/${member.photoURL}`
                        : "/images/users/user.png"
                    }
                    alt="Member Photo"
                    className="bg-gray-200 rounded-full h-24 w-24 mx-auto mb-2"
                  />
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-gray-500">{member.position}</p>
                  {/* Remove spinner from here */}
                </div>
              ))
            ) : null} {/* Remove the message from here */}
          </div>
          {selectedMembers.length === 0 && ( // Add the message here
            <p className="text-gray-500 text-center">No members added yet!</p>
          )}
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <button
          onClick={() => router.back()}
          className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-red-300"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
