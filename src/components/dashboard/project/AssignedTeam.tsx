import React, { useEffect, useState, useRef } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/utils/firebase";
import { FaSearch } from "react-icons/fa";
import { FiXCircle } from "react-icons/fi";

interface AssignedTeamProps {
  projectNo: string;
}

const AssignedTeam: React.FC<AssignedTeamProps> = ({ projectNo }) => {
  const [assignedTeamCodes, setAssignedTeamCodes] = useState<string[]>([]);
  const [assignedTeams, setAssignedTeams] = useState<any[]>([]);
  const [teamPickerOpen, setTeamPickerOpen] = useState<boolean>(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [memberData, setMemberData] = useState<{
    [email: string]: { photo?: string };
  }>({});
  const pickerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [removingTeamId, setRemovingTeamId] = useState<string | null>(null);
  const deletingSpinnerStyle = `absolute top-2 right-2 animate-spin inline-block w-5 h-5 border-4 border-t-transparent border-red-400 rounded-full`;
  const [addedTeamIds, setAddedTeamIds] = useState<string[]>([]);

  useEffect(() => {
    if (!projectNo || typeof projectNo !== "string") {
      console.error("Invalid project number:", projectNo);
      return;
    }

    const fetchAssignedTeamCodes = async () => {
      const projectRef = doc(db, "projects", projectNo);
      try {
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          const data = projectSnap.data();
          setAssignedTeamCodes(data.assignedTeam || []);
        } else {
          console.error("Project does not exist for projectNo:", projectNo);
        }
      } catch (error) {
        console.error(
          "Error fetching project for projectNo",
          projectNo,
          ":",
          error
        );
      }
    };

    fetchAssignedTeamCodes();
  }, [projectNo]);

  useEffect(() => {
    const fetchAssignedTeams = async () => {
      if (assignedTeamCodes.length === 0) return;

      const teamsRef = collection(db, "teams");
      const teamsSnapshot = await getDocs(teamsRef);
      const allTeams = teamsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const matchedTeams = allTeams.filter((team) =>
        assignedTeamCodes.includes(team.teamCode)
      );
      setAssignedTeams(matchedTeams);

      // Fetch member data for all unique emails
      const uniqueEmails = Array.from(
        new Set(matchedTeams.flatMap((team) => team.members || []))
      );
      fetchMemberData(uniqueEmails);
    };

    fetchAssignedTeams();
  }, [assignedTeamCodes]);

  const fetchMemberData = async (emails: string[]) => {
    if (emails.length === 0) return;

    const membersRef = collection(db, "members");
    const membersQuery = query(membersRef, where("email", "in", emails));
    const membersSnapshot = await getDocs(membersQuery);

    const memberDataMap: { [email: string]: { photo?: string } } = {};
    membersSnapshot.forEach((doc) => {
      const data = doc.data();
      memberDataMap[doc.id] = { photo: data.photo };
    });
    setMemberData(memberDataMap);
  };

  const fetchTeams = async () => {
    const teamsRef = collection(db, "teams");
    const teamsSnapshot = await getDocs(teamsRef);
    const teamsList = teamsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTeams(teamsList);
  };

  const handleAssignTeam = () => {
    fetchTeams();
    setAddedTeamIds([]);
    setTeamPickerOpen(true);
  };

  const handleSelectTeam = async (teamId: string) => {
    setLoading(true);
    setSelectedTeamId(teamId);

    const selectedTeam = teams.find((team) => team.id === teamId);

    if (!selectedTeam) {
      console.error("Selected team not found");
      setLoading(false);
      return;
    }

    const teamCode = selectedTeam.teamCode;

    if (assignedTeamCodes.includes(teamCode)) {
      setAddedTeamIds((prev) => [...prev, teamId]);
      setLoading(false);
      return;
    }

    const updatedAssignedTeamCodes = [...assignedTeamCodes, teamCode];

    const projectRef = doc(db, "projects", projectNo);
    await updateDoc(projectRef, {
      assignedTeam: updatedAssignedTeamCodes,
    });

    setAssignedTeamCodes(updatedAssignedTeamCodes);
    setTeamPickerOpen(false);
    setLoading(false);
    setSelectedTeamId(null);
  };

  const handleRemoveTeam = async (teamCode: string) => {
    setRemovingTeamId(teamCode);
    const updatedAssignedTeamCodes = assignedTeamCodes.filter(
      (code) => code !== teamCode
    );

    const projectRef = doc(db, "projects", projectNo);
    await updateDoc(projectRef, {
      assignedTeam: updatedAssignedTeamCodes,
    });

    setAssignedTeamCodes(updatedAssignedTeamCodes);
    setAssignedTeams((prevTeams) =>
      prevTeams.filter((team) => team.teamCode !== teamCode)
    );
    setRemovingTeamId(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredTeams = teams.filter((team) => {
    const teamName = team.teamName ? team.teamName.toLowerCase() : "";
    const teamCode = team.teamCode ? team.teamCode.toLowerCase() : "";
    return teamName.includes(searchTerm) || teamCode.includes(searchTerm);
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setTeamPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <h4 className="block text-gray-700 text-sm font-bold mb-2 col-span-4">
        Assigned Team
      </h4>
      {assignedTeams.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {assignedTeams.map((team: any) => (
            <div
              key={team.id}
              className="border px-4 py-2 rounded-lg flex-1 relative"
            >
              {removingTeamId === team.teamCode ? (
                <div className={deletingSpinnerStyle} />
              ) : (
                <FiXCircle
                  className="absolute top-2 right-2 cursor-pointer text-gray-400 hover:text-red-500"
                  size={20}
                  onClick={() => handleRemoveTeam(team.teamCode)}
                />
              )}

              <div className="flex justify-center space-x-[-10px]">
                {team.members
                  .slice(-3)
                  .map((email: string, memberIndex: number) => (
                    <img
                      key={memberIndex}
                      src={
                        memberData[email]?.photo
                          ? `/images/users/${email}/${memberData[email].photo}`
                          : "/images/users/user.png"
                      }
                      alt={`Team Member ${memberIndex + 1}`}
                      className="w-10 h-10 rounded-full border-2 border-white"
                    />
                  ))}
              </div>
              <div className="mt-2 text-center">
                <p className="text-gray-800 font-semibold">{team.teamName}</p>
                <p className="text-black border border-gray-800 bg-gray-200 px-2 rounded-full text-sm inline-block">
                  {team.teamCode}
                </p>
              </div>
            </div>
          ))}
          <div className="flex flex-1 justify-center items-center px-4 py-2 rounded-lg">
            <button
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-gray-800"
              onClick={handleAssignTeam}
            >
              Add More
            </button>
          </div>
        </div>
      ) : (
        <div className="w-2/4 flex justify-center items-center border px-6 py-4 rounded-lg">
          <button
            className="bg-gray-200 text-indigo-600 px-4 py-1 rounded-full text-sm"
            onClick={handleAssignTeam}
          >
            Assign Team
          </button>
        </div>
      )}

      {teamPickerOpen && (
        <div
          ref={pickerRef}
          className="absolute z-10 mt-1 bg-white border border-gray-300 rounded shadow-lg"
          style={{ width: "200px" }}
        >
          <div className="p-2">
            <div className="flex items-center border border-gray-300 rounded">
              <FaSearch className="ml-2 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search Teams..."
                className="p-2 w-full focus:outline-none"
              />
            </div>
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filteredTeams.slice(0, 3).map((team) => (
              <li
                key={team.id}
                className="px-4 border-b py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                onClick={() => handleSelectTeam(team.id)}
              >
                <p className="text-md text-gray-800">
                  {team.teamName}{" "}
                  <span className="text-sm">({team.teamCode})</span>
                  {addedTeamIds.includes(team.id) && (
                    <span className="text-xs bg-green-500 text-white rounded-full px-2 py-1 ml-2">
                      Added
                    </span>
                  )}
                </p>
                {loading && selectedTeamId === team.id ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 ml-2"></span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default AssignedTeam;
