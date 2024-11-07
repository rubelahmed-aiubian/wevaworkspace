//src/components/dashboard/AddProject.tsx
"use client";
import Swal from "sweetalert2";
import { db } from "../../utils/firebase";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";

export default function AddProject({ onClose }) {
  const { user, userData } = useAuth();
  const [projectName, setProjectName] = useState("");
  const [errors, setErrors] = useState({
    projectName: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Generate a 2-digit unique project number
  const generateProjectId = async () => {
    const projectQuery = collection(db, "projects");
    const projectSnapshot = await getDocs(projectQuery);

    // Extract existing project IDs and convert them to numbers
    const existingIds = projectSnapshot.docs.map((doc) => parseInt(doc.id, 10));

    // Determine the next project ID
    let nextId = 1; // Start from 1
    while (existingIds.includes(nextId)) {
      nextId++;
    }

    // Return the project ID as a two-digit string
    return nextId.toString().padStart(2, "0");
  };

  // Function to validate form fields
  const validateFields = async () => {
    const newErrors = {
      projectName: !projectName.trim(),
    };

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleAddProject = async () => {
    setIsLoading(true);
    const isValid = await validateFields();
    if (!isValid) {
      setIsLoading(false);
      return;
    }

    // Check if the user is authenticated and is an admin
    if (!user || userData?.position !== "Admin") {
      Swal.fire({
        title: "Error",
        text: "You don't have permission to add projects.",
        icon: "error",
        confirmButtonColor: "#02122b",
      });
      setIsLoading(false);
      return;
    }

    // Fire SweetAlert for confirmation
    Swal.fire({
      text: "Are you sure to add this project?",
      width: 400,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#02122b",
      cancelButtonColor: "#d33",
      confirmButtonText: "Add Project",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const projectId = await generateProjectId();
          await setDoc(doc(db, "projects", projectId), {
            projectId,
            projectName,
            projectManager: null,
            projectStatus: "Pending",
            createdTime: new Date().toISOString(),
            assignedTeam: null,
            projectDescription: null,
            projectTask: null,
          });

          Swal.fire({
            title: "Success",
            text: "Project has been added successfully!",
            width: 400,
            timer: 2000,
            timerProgressBar: true,
            confirmButtonColor: "#02122b",
          }).then(() => {
            router.push(`/dashboard/projects/${projectId}`);
          });
        } catch (error) {
          console.error("Error adding project:", error);
          Swal.fire({
            text: "Failed to add project.",
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
      }));
    }
  };

  const handleCancel = () => {
    onClose();
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
              Add New Project
            </h2>

            <div className="mb-4">
              <input
                type="text"
                value={projectName}
                onChange={handleInputChange(setProjectName, "projectName")}
                className={`mt-1 block w-full p-2 border ${
                  errors.projectName ? "border-red-500" : "border-gray-300"
                } rounded`}
                placeholder="Enter Project Name"
              />
            </div>

            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={handleAddProject}
                className="bg-gray-800 text-white px-4 py-2 rounded flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    &nbsp; Adding...
                  </>
                ) : (
                  "Add Project"
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
