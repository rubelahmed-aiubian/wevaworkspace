import { db } from "@/utils/firebase";
import { FaSearch } from "react-icons/fa";
import { RiExchange2Line } from "react-icons/ri";
import Skeleton from "react-loading-skeleton";
import React, { useState, useEffect, useRef } from "react";
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  getDoc,
} from "firebase/firestore";

interface ProjectManagerProps {
  projectNo: string;
  initialManagerId: string;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
  projectNo,
  initialManagerId,
}) => {
  const [projectManager, setProjectManager] = useState<any>(null);
  const [isManagerPickerOpen, setIsManagerPickerOpen] = useState(false);
  const [managerSearch, setManagerSearch] = useState("");
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  // Fetch project manager data using initialManagerId
  useEffect(() => {
    const fetchManagerDetails = async () => {
      if (initialManagerId) {
        try {
          setLoading(true);
          const managerDocRef = doc(db, "members", initialManagerId);
          const managerSnap = await getDoc(managerDocRef);

          if (managerSnap.exists()) {
            const managerData = {
              id: managerSnap.id,
              name: managerSnap.data().name,
              officeId: managerSnap.data().id,
              photo: managerSnap.data().photo,
              position: managerSnap.data().position,
            };
            setProjectManager(managerData);
          } else {
            console.warn(`Manager with ID ${initialManagerId} does not exist.`);
            setProjectManager(null);
          }
        } catch (error) {
          console.error("Error fetching manager details:", error);
        } finally {
          setLoading(false); // End loading
        }
      } else {
        setLoading(false);
      }
    };

    fetchManagerDetails();
  }, [initialManagerId]);

  // Fetch all members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersCollection = collection(db, "members");
        const memberSnapshot = await getDocs(membersCollection);
        const membersData = memberSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id, //member email
            officeId: data.id,
            name: data.name,
            position: data.position,
            photo: data.photo,
          };
        });

        console.log("Fetched members data:", membersData);
        setAllMembers(membersData);
        setFilteredMembers(membersData);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    const filtered = allMembers.filter((member) =>
      member.name.toLowerCase().includes(managerSearch.toLowerCase())
    );
    setFilteredMembers(filtered);
  }, [managerSearch, allMembers]);

  const handleManagerChange = async (selectedMember) => {
    setProjectManager(selectedMember);
    setIsManagerPickerOpen(false);
    try {
      const docRef = doc(db, "projects", projectNo);
      await updateDoc(docRef, {
        projectManager: selectedMember.id,
      });
    } catch (error) {
      console.error("Error updating project manager:", error);
    }
  };

  // Handle click outside to close the picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsManagerPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Project Manager
      </label>
      <div className="flex items-center justify-center border px-6 py-4 rounded-lg flex-1 relative">
        {loading ? (
          // Skeleton loading effect
          <div className="flex items-center">
            <Skeleton circle={true} height={48} width={48} className="mr-4" />
            <div className="flex flex-col">
              <Skeleton height={20} width={150} className="mr-4" />
              <Skeleton height={20} width={50} className="mr-4" />
            </div>
          </div>
        ) : projectManager ? (
          <>
            <img
              src={
                projectManager.photo
                  ? `/images/users/${projectManager.id}/${projectManager.photo}`
                  : "/images/users/user.png" // Default photo path
              }
              alt="Project Manager Photo"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="ml-4 flex items-center justify-between w-full">
              <div>
                <p className="text-gray-800 font-semibold">
                  {projectManager.name}
                </p>
                <p className="text-gray-500 text-sm">
                  {projectManager.position}
                </p>
              </div>
              <button
                onClick={() => setIsManagerPickerOpen(true)}
                className="flex items-center bg-indigo-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-800"
              >
                <RiExchange2Line className="mr-1" />
                Change
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => setIsManagerPickerOpen(true)}
            className="flex items-center bg-gray-200 text-indigo-600 px-4 py-1 rounded-full text-sm"
          >
            Add Project Manager
          </button>
        )}

        {isManagerPickerOpen && (
          <div
            ref={pickerRef}
            className="absolute z-10 mt-1 bg-white border border-gray-300 rounded shadow-lg"
            style={{ width: "200px", top: "100%" }}
          >
            <div className="p-2">
              <div className="flex items-center border border-gray-300 rounded">
                <FaSearch className="ml-2 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={managerSearch}
                  onChange={(e) => setManagerSearch(e.target.value)}
                  placeholder="Search Managers..."
                  className="p-2 w-full focus:outline-none"
                />
              </div>
            </div>
            <ul className="max-h-48 overflow-y-auto">
              {filteredMembers.slice(0, 3).map((manager) => (
                <li
                  key={manager.id}
                  onClick={() => handleManagerChange(manager)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                >
                  <img
                    src={
                      manager.photo
                        ? `/images/users/${manager.id}/${manager.photo}`
                        : "/images/users/user.png"
                    }
                    alt="Manager Photo"
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div>
                    <p className="text-sm font-semibold">{manager.name}</p>
                    <p className="text-xs text-gray-500">{manager.position}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectManager;
