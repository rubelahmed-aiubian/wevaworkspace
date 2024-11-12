//src/components/dashboard/AddTeam.tsx
"use client";
import Swal from "sweetalert2";
import React, { useState, useEffect } from "react";
import { db } from "@/utils/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import Image from "next/image";

export default function AddTeam({ onClose, onTeamAdded }) {
  const { user, userData } = useAuth();
  const [teamCode, setTeamCode] = useState("");
  const [teamName, setTeamName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [membersList, setMembersList] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [errors, setErrors] = useState({
    teamCode: false,
    teamName: false,
    teamCodeExists: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch members to display in the team member dropdown
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersQuery = collection(db, "members");
        const membersSnapshot = await getDocs(membersQuery);
        const members = membersSnapshot.docs.map((doc) => doc.data());
        setMembersList(members);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };
    fetchMembers();
  }, []);

  // Function to validate form fields
  const validateFields = async () => {
    const newErrors = {
      teamCode: !teamCode.trim(),
      teamName: !teamName.trim(),
      teamCodeExists: false,
    };

    // Check if the team code is already registered in Firestore
    if (!newErrors.teamCode) {
      const teamCodeQuery = query(
        collection(db, "teams"),
        where("teamCode", "==", teamCode)
      );
      const teamCodeSnapshot = await getDocs(teamCodeQuery);
      if (!teamCodeSnapshot.empty) {
        newErrors.teamCodeExists = true;
      }
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleAddTeam = async () => {
    setIsLoading(true);
    const isValid = await validateFields();
    if (!isValid) {
      setIsLoading(false);
      return;
    }

    if (!user || userData?.position !== "Admin") {
      Swal.fire({
        title: "Error",
        text: "You don't have permission to add teams.",
        icon: "error",
        confirmButtonColor: "#02122b",
      });
      setIsLoading(false);
      return;
    }

    // Fire SweetAlert for confirmation
    Swal.fire({
      text: "Are you sure?",
      width: 400,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#02122b",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const teamLeaderId =
            selectedMembers.length > 0 ? selectedMembers[0].memberId : null;

          await setDoc(doc(db, "teams", teamCode), {
            teamCode,
            teamName,
            members: selectedMembers.map((member) => member.memberId),
            teamLeader: teamLeaderId,
            teamStatus: "Disabled",
          });

          Swal.fire({
            title: "Success",
            text: "Team has been added successfully!",
            width: 400,
            timer: 2000,
            timerProgressBar: true,
            confirmButtonColor: "#02122b",
          }).then(() => {
            // Refresh teams without redirecting
            if (onTeamAdded) {
              onTeamAdded(); // Call the refresh function passed as a prop
            }
            onClose(); // Close the modal
          });
        } catch (error) {
          console.error("Error adding team:", error);
          Swal.fire({
            text: "Failed to add team.",
            icon: "error",
            width: 400,
            confirmButtonColor: "#02122b",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    });
  };

  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    if (errors[field]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: false,
        teamCodeExists:
          field === "teamCode" ? false : prevErrors.teamCodeExists,
      }));
    }
  };

  const handleCancel = () => {
    onClose();
  };

  // Filter members based on search term
  const filteredMembers = membersList.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle selecting a member (only store memberId)
  const handleSelectMember = (member) => {
    const newMember = {
      memberId: member.email, // Use the unique ID of the member document
    };

    setSelectedMembers([newMember]); // Only allow one selected member (the team leader)
    setSearchTerm(member.name);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-gray-800 opacity-70 z-40"
        onClick={handleCancel}
      ></div>
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative">
          <div className="p-8">
            <h2 className="text-md font-semibold mb-4 text-center">
              Add New Team
            </h2>

            <div className="mb-4">
              <input
                type="text"
                value={teamCode}
                onChange={handleInputChange(setTeamCode, "teamCode")}
                className={`mt-1 block w-full p-2 border ${
                  errors.teamCode || errors.teamCodeExists
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded`}
                placeholder="Enter Team Code (eg. IT001)"
                maxLength={5}
              />
              {errors.teamCodeExists && (
                <p className="text-red-500 text-sm">
                  Team code is already registered
                </p>
              )}
            </div>

            <div className="mb-4">
              <input
                type="text"
                value={teamName}
                onChange={handleInputChange(setTeamName, "teamName")}
                className={`mt-1 block w-full p-2 border ${
                  errors.teamName ? "border-red-500" : "border-gray-300"
                } rounded`}
                placeholder="Enter Team Name"
              />
            </div>

            {/* Team Members with Search Box */}
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                placeholder="Search For Team Leader..."
              />
              <div className="mt-2 max-h-48 overflow-y-auto">
                {searchTerm &&
                  filteredMembers.map((member) => (
                    <div
                      key={member.email}
                      onClick={() => handleSelectMember(member)}
                      className={`flex items-center p-2 cursor-pointer rounded ${
                        selectedMembers.some(
                          (selected) => selected.email === member.email
                        )
                          ? "bg-gray-300"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <Image
                        src={
                          member.photo
                            ? `/images/users/${member.email}/${member.photo}`
                            : "/images/users/user.png"
                        }
                        alt={member.name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-gray-500">
                          {member.position}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={handleAddTeam}
                className="bg-gray-800 text-white px-4 py-2 rounded flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    &nbsp; Adding...
                  </>
                ) : (
                  "Add Team"
                )}
              </button>
              <button
                onClick={handleCancel}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
