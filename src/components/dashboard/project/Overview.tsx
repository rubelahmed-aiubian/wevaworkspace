//src/components/dashboard/project/Overview.tsx
import React, { useState, useRef, useEffect } from "react";
import { doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import ProjectManager from "./ProjectManager";
import ProjectDate from "./ProjectDate";
import AssignedTeam from "./AssignedTeam";
import ProjectFiles from "./ProjectFiles";
import { useRouter } from "next/navigation";
import ProjectComments from "./ProjectComment";

interface OverviewProps {
  projectNo: string;
}

const Overview: React.FC<OverviewProps> = ({ projectNo }) => {
  const router = useRouter();
  // const { user, userData } = useAuth();
  const [projectDescription, setProjectDescription] = useState<string>("");
  const [projectManager, setProjectManager] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [initialDescription, setInitialDescription] = useState<string>("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch project data on mount
  useEffect(() => {
    const fetchProjectData = async () => {
      const docRef = doc(db, "projects", projectNo);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const projectData = docSnap.data();
        setProjectDescription(projectData?.projectDescription || "");
        setInitialDescription(projectData?.projectDescription || "");
        setProjectManager(projectData?.projectManager || null);
      }
    };

    if (projectNo) {
      fetchProjectData();
    }
  }, [projectNo]);

  // Save project description to Firebase
  const saveProjectDescription = async () => {
    if (projectDescription !== initialDescription) {
      try {
        const docRef = doc(db, "projects", projectNo);
        await updateDoc(docRef, { projectDescription });
        setInitialDescription(projectDescription);
        console.log("Project description updated successfully");
      } catch (error) {
        console.error("Error updating project description:", error);
      }
    }
  };

  // Handle click outside to save the description
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsEditing(false);
        saveProjectDescription();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [projectDescription]);

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setProjectDescription(e.target.value);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    saveProjectDescription();
  };

  // Function to handle project deletion
  const handleDeleteProject = async () => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "projects", projectNo));
      setShowConfirmation(false);
      // Redirect to projects page after successful deletion
      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 w-full h-full overflow-hidden">
      <div className="flex-1 flex flex-col justify-start w-2/3">
        <div className="mb-4">
          <h4 className="text-sm text-gray-800 font-semibold">
            Project Description:
          </h4>
          <textarea
            rows={3}
            ref={inputRef}
            value={projectDescription}
            onChange={handleDescriptionChange}
            onClick={handleEditClick}
            onBlur={handleBlur}
            className="w-full p-2 mt-2 border border-gray-200 rounded focus:outline-none focus:border-indigo-600"
            readOnly={!isEditing}
            placeholder="Add project description..."
          />
        </div>

        {/* Pass the project manager data to the ProjectManager component */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <ProjectManager
              projectNo={projectNo}
              initialManagerId={projectManager}
            />
          </div>
          <div className="flex flex-col">
            <ProjectDate projectNo={projectNo} />
          </div>
        </div>
        {/* Assigned Team */}
        <div className="mb-4">
          <AssignedTeam projectNo={projectNo} />
        </div>
        {/* Project Files */}
        <div>
          <ProjectFiles projectNo={projectNo} />
        </div>

        <div className="flex justify-center mt-4">
          <button
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
            onClick={() => setShowConfirmation(true)} // Show confirmation dialog
          >
            Delete Project
          </button>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
            <div className="bg-white rounded-2xl p-4 shadow-lg z-50 sm:max-w-lg sm:w-full m-5">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h4 className="text-md text-gray-900 font-semibold">
                  Delete Project
                </h4>
              </div>
              <div className="overflow-y-auto py-4 min-h-[100px]">
                <p className="text-gray-600 text-sm">
                  Are you sure you want to delete this project?
                </p>
              </div>
              <div className="flex items-center justify-end pt-4 border-t border-gray-200 space-x-4">
                <button
                  className="py-2.5 px-5 text-xs bg-gray-300 text-gray-700 rounded cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 hover:bg-gray-400"
                  onClick={() => setShowConfirmation(false)} // Close modal
                >
                  Cancel
                </button>
                <button
                  className="py-2.5 px-5 text-xs bg-red-600 text-white rounded cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 hover:bg-red-700 flex items-center justify-center"
                  onClick={handleDeleteProject}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                      Deleting...
                    </>
                  ) : (
                    "Yes, Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-none w-1/3 flex flex-col bg-gray-100 p-4 rounded-lg overflow-y-auto">
        <ProjectComments projectNo={projectNo} />
      </div>
    </div>
  );
};

export default Overview;
