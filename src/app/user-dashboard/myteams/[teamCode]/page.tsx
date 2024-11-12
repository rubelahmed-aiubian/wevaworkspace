"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/utils/firebase";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/components/common/SidebarContext";
import Skeleton from "react-loading-skeleton";
import Image from "next/image";

import {
  collection,
  doc,
  getDoc,
  where,
  query,
  getDocs,
} from "firebase/firestore";

const TeamPage = ({ params }: { params: { teamCode: string } }) => {
  const router = useRouter();
  const { userData } = useAuth();
  const { teamCode } = params;
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isSidebarOpen } = useSidebar();

  useEffect(() => {
    const fetchTeamDetails = async () => {
      if (userData && teamCode) {
        try {
          const teamQuery = query(
            collection(db, "teams"),
            where("teamCode", "==", teamCode),
            where("members", "array-contains", userData.email)
          );
          const teamSnapshot = await getDocs(teamQuery);
          if (!teamSnapshot.empty) {
            const teamData = teamSnapshot.docs[0].data();
            setTeam(teamData);

            const memberDataPromises = teamData.members.map(
              async (memberEmail: string) => {
                const memberSnapshot = await getDoc(
                  doc(db, "members", memberEmail)
                );
                if (memberSnapshot.exists()) {
                  const memberData = memberSnapshot.data();
                  return {
                    email: memberEmail,
                    name: memberData.name,
                    photoURL: memberData.photo,
                    position: memberData.position,
                  };
                }
                return null;
              }
            );
            const resolvedMembers = (
              await Promise.all(memberDataPromises)
            ).filter(Boolean);
            setMembers(resolvedMembers);
          }
        } catch (error) {
          console.error("Error fetching team details:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTeamDetails();
  }, [userData, teamCode]);

  return (
    <div
      className={`flex-auto ${
        isSidebarOpen ? "ml-64" : "ml-16"
      } mt-16 transition-all duration-300 overflow-hidden`}
    >
      <h1 className="flex items-center gap-2 text-xl font-bold mb-4">
        Team Details{" "}
        <span className="text-sm text-gray-400 font-normal">
          (team code: {teamCode})
        </span>
      </h1>

      {/* Skeleton Effect */}
      {loading ? (
        <div className="flex space-x-6">
          {/* Team Details Skeleton */}
          <div className="w-4/12 rounded-lg overflow-hidden border border-gray-300 bg-white">
            <table className="table-auto w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th colSpan={2} className="p-2 text-center text-lg font-bold">
                    <Skeleton width="100px" height="20px" />
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="p-2">
                    <Skeleton width="80%" height="20px" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-2">
                    <Skeleton width="100%" height="20px" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-2">
                    <Skeleton width="50%" height="20px" />
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="p-2">
                    <Skeleton width="100%" height="20px" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Profile Grid Skeleton */}
          <div className="w-8/12">
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center border border-gray-200 rounded-lg p-4"
                >
                  <Skeleton circle height={100} width={100} />
                  <Skeleton width="100px" height="20px" className="mt-2" />
                  <Skeleton width="80px" height="15px" className="mt-1" />
                </div>
              ))}
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
                  <td className="p-2">{team.teamCode || "N/A"}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-2 font-semibold">Team Name:</td>
                  <td className="p-2">{team.teamName || "N/A"}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-2 font-semibold">Members:</td>
                  <td className="p-2">{members.length} members</td>
                </tr>
                <tr>
                  <td colSpan={2} className="p-2 border-b border-gray-200">
                    <p
                      className={`w-full rounded py-2 text-white flex justify-center items-center ${
                        team.teamStatus === "Active"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                    >
                      {team.teamStatus || "Active"}
                    </p>
                  </td>
                </tr>
                <tr className="text-center">
                  <td colSpan={2} className="p-2">
                    <button
                      className="bg-gray-800 text-white px-4 py-2 rounded"
                      onClick={() => router.back()}
                    >
                      Go Back
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Members Details */}
          <div className="w-8/12">
            <div className="grid grid-cols-3 gap-4">
              {members.length > 0 ? (
                members.map((member, index) => (
                  <div
                    key={index}
                    className="text-center border rounded-lg p-4 mb-4 relative"
                  >
                    <Image
                      src={
                        member.photoURL
                          ? `/images/users/${member.email}/${member.photoURL}`
                          : "/images/users/user.png"
                      }
                      width={100}
                      height={100}
                      alt="Member Photo"
                      className="bg-gray-200 rounded-full h-24 w-24 mx-auto mb-2 object-cover"
                    />
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-gray-500">{member.position || "N/A"}</p>
                    {member.email === team.teamLeader && (
                      <p className="text-xs bg-gray-800 text-white rounded-full px-2 py-1">
                        Team leader
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center">No members added yet!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;
