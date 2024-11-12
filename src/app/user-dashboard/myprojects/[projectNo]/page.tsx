"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/utils/firebase";
import ProjectComments from "@/components/dashboard/project/ProjectComment";
import { doc, getDoc } from "firebase/firestore";
import { useSidebar } from "@/components/common/SidebarContext";
import { FiFileText, FiDownload } from "react-icons/fi";
import Image from "next/image";

export default function ProjectDetails({
  params,
}: {
  params: { projectNo: string };
}) {
  const [project, setProject] = useState(null);
  const [projectManager, setProjectManager] = useState(null);
  const [files, setFiles] = useState([]);
  const router = useRouter();
  const { isSidebarOpen } = useSidebar();
  const { projectNo } = params;
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    sec: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      if (projectNo) {
        const projectRef = doc(db, "projects", projectNo);
        const projectSnap = await getDoc(projectRef);
        if (projectSnap.exists()) {
          const data = projectSnap.data();
          setProject({ id: projectSnap.id, ...data });

          const fileList = (data.projectFiles || []).map((fileName) => ({
            fileName,
            path: `/files/project/${projectNo}/${fileName}`,
          }));
          setFiles(fileList);

          const managerRef = doc(db, "members", data.projectManager);
          const managerSnap = await getDoc(managerRef);
          if (managerSnap.exists()) {
            const managerData = {
              id: managerSnap.id,
              name: managerSnap.data().name,
              photo: managerSnap.data().photo,
              position: managerSnap.data().position,
            };
            setProjectManager(managerData);
          } else {
            setProjectManager(null);
          }
        }
      }
      setLoading(false);
    };
    fetchProjectData();
  }, [projectNo]);

  useEffect(() => {
    if (
      project &&
      project.startDate &&
      project.endDate &&
      project.status !== "Pending"
    ) {
      const targetTime = new Date(project.endDate).getTime();

      const updateTimer = () => {
        const currentTime = new Date().getTime();
        const difference = targetTime - currentTime;

        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            mins: Math.floor((difference / 1000 / 60) % 60),
            sec: Math.floor((difference / 1000) % 60),
          });
        } else {
          clearInterval(timer);
        }
      };

      const timer = setInterval(updateTimer, 1000);

      return () => clearInterval(timer);
    }
  }, [project]);

  return (
    <div
      className={`flex-auto h-full ${
        isSidebarOpen ? "ml-64" : "ml-16"
      } mt-16 transition-all duration-300 flex flex-col`}
    >
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          <h1 className="flex items-center gap-2 text-xl font-bold mb-4">
            Project Details{" "}
            <span className="text-sm text-gray-400 font-normal">
              (project no: {projectNo})
            </span>
          </h1>

          <div className="bg-gray-100 rounded-lg flex justify-between items-center p-4 mb-6">
            <div className="flex flex-col">
              <h2 className="text-md font-semibold">{project?.projectName}</h2>
              <p className="text-sm text-gray-400 font-normal">
                (created on:{" "}
                {new Date(project?.createdTime).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
                )
              </p>
            </div>

            <div className="flex justify-center">
              <div className="flex items-center w-full gap-4 count-down-main">
                {["days", "hours", "mins", "sec"].map((unit, index) => (
                  <div className="timer w-8" key={index}>
                    <div className="bg-indigo-600 rounded-lg py-1 overflow-hidden">
                      <h3 className="countdown-element font-Cormorant font-semibold text-md text-white text-center">
                        {timeLeft[unit]}
                      </h3>
                    </div>
                    <p className="text-xs font-Cormorant font-normal text-gray-900 mt-1 text-center w-full">
                      {unit.charAt(0).toUpperCase() + unit.slice(1)}
                    </p>
                  </div>
                ))}
                <span
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    project?.projectStatus === "Pending"
                      ? "bg-gray-400"
                      : project?.projectStatus === "In Progress"
                      ? "bg-green-400"
                      : project?.projectStatus === "In Review"
                      ? "bg-yellow-400"
                      : project?.projectStatus === "Completed"
                      ? "bg-green-600"
                      : project?.projectStatus === "Canceled"
                      ? "bg-red-400"
                      : project?.projectStatus === "Due Project"
                      ? "bg-red-600"
                      : "bg-gray-300"
                  }`}
                >
                  {project?.projectStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <h3 className="text-sm text-gray-800 font-semibold">
                  Description:
                </h3>
                <p className="text-gray-700 text-justify text-sm">
                  {project?.projectDescription || "No description available"}
                </p>
              </div>
              <div className="mb-4">
                <h3 className="text-sm text-gray-800 font-semibold">
                  Due Dates:
                </h3>
                <p className="text-gray-700 text-justify">
                  Start Date:{" "}
                  {new Date(project?.startDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="text-gray-700 text-justify">
                  End Date:{" "}
                  {new Date(project?.endDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="mb-4">
                <h3 className="text-sm text-gray-800 font-semibold">
                  Project Manager:
                </h3>
                {projectManager && (
                  <div className="inline-flex items-center mt-4 gap-2 bg-gray-50 rounded-full p-1">
                    <Image
                      src={
                        projectManager.photo
                          ? `/images/users/${projectManager.id}/${projectManager.photo}`
                          : "/images/users/user.png"
                      }
                      width={50}
                      height={50}
                      alt="Project Manager"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-sm text-gray-800 font-semibold pr-4">
                        {projectManager.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {projectManager.position}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <h3 className="text-sm text-gray-800 font-semibold">
                  Assigned Team:
                </h3>
                <p className="text-gray-700">
                  {project?.assignedTeam?.join(", ") || "No team assigned"}
                </p>
              </div>

              <div className="w-full mb-4">
                <h3 className="text-sm text-gray-800 font-semibold mb-2">
                  Files:
                </h3>
                <table className="table-auto w-full rounded-lg overflow-hidden bg-white shadow">
                  <tbody>
                    {files.length > 0 ? (
                      files.map((file) => (
                        <tr
                          key={file.path}
                          className="hover:bg-gray-50 odd:bg-white even:bg-gray-50"
                        >
                          <td className="p-2 text-gray-900">
                            <div className="flex items-center gap-2">
                              <FiFileText size={20} color="#4F46E5" />
                              <span className="text-sm">{file.fileName}</span>
                            </div>
                          </td>
                          <td className="flex items-center justify-end gap-2 p-2 text-center text-gray-400 hover:text-indigo-600">
                            <FiDownload
                              className="cursor-pointer"
                              size={20}
                              onClick={() => window.open(file.path)}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={2}
                          className="text-center p-4 text-gray-500"
                        >
                          No files available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col bg-gray-100 rounded-lg p-4 flex-grow">
              <ProjectComments projectNo={projectNo} />
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <button
              className="bg-gray-800 text-white px-4 py-2 rounded-md"
              onClick={() => router.back()}
            >
              Go Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}
