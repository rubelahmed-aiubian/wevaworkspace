"use client";
import React from "react";
import { useRouter } from "next/navigation";
import ProjectComments from "@/components/dashboard/project/ProjectComment"; // Adjust the path as necessary
import { db } from "@/utils/firebase";
import { doc, getDoc } from "firebase/firestore";

const ProjectDetails = () => {
  const router = useRouter();
  const { projectId } = router.query; // Get projectId from URL parameters
  const [project, setProject] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // Fetch project details based on projectId
  const fetchProjectDetails = async () => {
    if (projectId) {
      const projectDocRef = doc(db, "projects", projectId as string);
      const projectSnap = await getDoc(projectDocRef);
      if (projectSnap.exists()) {
        setProject({ id: projectSnap.id, ...projectSnap.data() });
      } else {
        console.error("No such project!");
      }
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>No project found!</div>;

  return (
    <div className="p-4">
      {/* Header Section */}
      <div className="bg-gray-100 rounded p-4 flex justify-between">
        <h2 className="text-lg font-semibold">{project.projectName}</h2>
        <span
          className={`px-2 py-1 rounded ${
            project.projectStatus === "Pending"
              ? "bg-gray-400"
              : project.projectStatus === "In Progress"
              ? "bg-green-400"
              : project.projectStatus === "In Review"
              ? "bg-yellow-400"
              : project.projectStatus === "Completed"
              ? "bg-green-600"
              : project.projectStatus === "Canceled"
              ? "bg-red-500"
              : "bg-gray-400"
          }`}
        >
          {project.projectStatus}
        </span>
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <h3 className="font-semibold">Description:</h3>
          <p>{project.description}</p>
          <h3 className="font-semibold">Project Manager:</h3>
          <p>{project.projectManagerInfo?.name || "No Manager"}</p>
          <h3 className="font-semibold">Assigned Team:</h3>
          <p>{project.assignedTeam?.join(", ") || "No Team Assigned"}</p>
          <h3 className="font-semibold">Files:</h3>
          <p>{project.files?.join(", ") || "No Files"}</p>
        </div>
        <div>
          <h3 className="font-semibold">Comments:</h3>
          <ProjectComments projectId={projectId as string} />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
