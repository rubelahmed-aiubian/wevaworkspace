"use client";
import { db } from "@/utils/firebase";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();
  const projectsPerPage = 10;

  const router = useRouter();

  // Function to fetch project manager details
  const fetchProjectManagerDetails = async (projectManagerId: string) => {
    if (projectManagerId) {
      const managerDocRef = doc(db, "members", projectManagerId);
      const managerSnap = await getDoc(managerDocRef);
      return managerSnap.exists()
        ? { id: managerSnap.id, ...managerSnap.data() }
        : null;
    }
    return null; // Return null if no project manager ID
  };

  // Fetch and set projects
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const projectsCollection = collection(db, "projects");
      const querySnapshot = await getDocs(projectsCollection);

      const projectsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const project = { id: doc.id, ...doc.data() };
          if (project.projectManager) {
            project.projectManagerInfo = await fetchProjectManagerDetails(
              project.projectManager
            );
          } else {
            project.projectManagerInfo = null;
          }
          return project;
        })
      );

      // Fetch teams data to check members
      const teamsCollection = collection(db, "teams");
      const teamsSnapshot = await getDocs(teamsCollection);
      const allTeams = teamsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const userProjects = projectsData.filter((project) => {
        if (Array.isArray(project.assignedTeam)) {
          return project.assignedTeam.some((teamId) => {
            const team = allTeams.find((t) => t.id === teamId);
            return team && team.members.includes(userData.email);
          });
        }
        return project.projectManager === userData.email;
      });

      // Log the filtered projects for debugging
      console.log("Filtered user projects:", userProjects);

      setProjects(userProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const formatDate = (date: any) => {
    if (!date) return "";
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return parsedDate.toLocaleDateString("en-US", options);
  };

  const totalPages = Math.ceil(projects.length / projectsPerPage);

  const paginatedProjects = projects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  return (
    <div className="p-4">
      <div className="rounded-lg overflow-hidden border border-gray-300 bg-white">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th
                className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"
                style={{ width: "15%" }}
              >
                Project No.
              </th>
              <th
                className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"
                style={{ width: "25%" }}
              >
                Project Name
              </th>
              <th
                className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"
                style={{ width: "25%" }}
              >
                Project Manager
              </th>
              <th
                className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"
                style={{ width: "20%" }}
              >
                Due Date
              </th>
              <th
                className="p-5 text-center text-sm leading-6 font-semibold text-gray-900 capitalize"
                style={{ width: "15%" }}
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index} className="odd:bg-white even:bg-gray-50">
                  <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    <Skeleton height={20} width={40} />
                  </td>
                  <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    <Skeleton height={20} width={120} />
                  </td>
                  <td
                    className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900"
                    style={{ width: "200px" }}
                  >
                    <div className="inline-flex items-center rounded-full px-2 py-1 bg-gray-200">
                      <Skeleton
                        circle={true}
                        height={40}
                        width={40}
                        className="mr-2"
                      />
                      <div className="pr-2">
                        <Skeleton height={20} width={80} />
                        <Skeleton height={15} width={60} />
                      </div>
                    </div>
                  </td>
                  <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    <Skeleton height={20} width={100} />
                  </td>
                  <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900 text-center">
                    <Skeleton height={20} width={30} />
                  </td>
                </tr>
              ))
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  No projects found!
                </td>
              </tr>
            ) : (
              paginatedProjects.map((project, index) => (
                <tr
                  key={index}
                  className="odd:bg-white even:bg-gray-50 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() =>
                    router.push(`/user-dashboard/myprojects/${project.id}`)
                  }
                >
                  <td className="p-4 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    {project.projectId}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    {project.projectName}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    <div className="inline-flex items-center rounded-full px-1 py-1 bg-gray-200">
                      {project.projectManagerInfo &&
                      Object.keys(project.projectManagerInfo).length > 0 ? (
                        <>
                          <img
                            src={
                              project.projectManagerInfo.photo
                                ? `/images/users/${project.projectManagerInfo.email}/${project.projectManagerInfo.photo}`
                                : "/images/users/user.png" // Default photo if no photo found
                            }
                            alt="Project Manager"
                            className="rounded-full w-10 h-10 mr-2"
                          />
                          <div className="pr-2">
                            <div className="text-sm font-semibold pr-2">
                              {project.projectManagerInfo.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {project.projectManagerInfo.position}
                            </div>
                          </div>
                        </>
                      ) : (
                        <span>No Manager</span> // Fallback if no manager info
                      )}
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    {project.endDate ? formatDate(project.endDate) : "Not Set"}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm leading-6 font-medium text-gray-900 text-center">
                    <span
                      className={`w-full inline-block px-2 py-1 rounded ${
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col items-center mt-4 pt-2">
        {/* Help text */}
        <span className="text-sm text-gray-700 dark:text-gray-400">
          Showing {(currentPage - 1) * projectsPerPage + 1} to{" "}
          {Math.min(currentPage * projectsPerPage, projects.length)} of{" "}
          {projects.length} projects
        </span>
        <div className="inline-flex mt-2 xs:mt-0">
          {projects.length > projectsPerPage && (
            <>
              <button
                onClick={() =>
                  currentPage > 1 && setCurrentPage(currentPage - 1)
                }
                className="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900"
                disabled={currentPage === 1}
              >
                <FaChevronLeft className="me-2" />
                Prev
              </button>
              <button
                onClick={() =>
                  currentPage < totalPages && setCurrentPage(currentPage + 1)
                }
                className="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-gray-800 border-0 border-s border-gray-700 rounded-e hover:bg-gray-900"
                disabled={currentPage === totalPages}
              >
                Next
                <FaChevronRight className="ms-2" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
