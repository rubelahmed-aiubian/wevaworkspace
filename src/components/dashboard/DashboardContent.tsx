// DashboardContent.tsx
import { useEffect, useState } from "react";
import { db } from "@/utils/firebase";
import { collection, getDocs, limit, query, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAuth } from "@/context/AuthContext";

export default function DashboardContent() {
  const { userData } = useAuth();
  const [taskCount, setTaskCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const router = useRouter();
  // Fetch tasks data
  const fetchTasksData = async () => {
    setLoadingTasks(true);
    let totalTaskCount = 0;
    const userEmail = userData.email; // Get the user's email
    const taskDocs = await getDocs(collection(db, "tasks"));
    const allTasks = [];

    // Filter tasks based on the createdBy field
    for (const doc of taskDocs.docs) {
      const taskData = doc.data();
      if (taskData.createdBy === userEmail) {
        // Check if createdBy matches userEmail
        allTasks.push(taskData);
        totalTaskCount++;
      }
    }

    setTaskCount(totalTaskCount);
    setRecentTasks(allTasks.slice(0, 10));
    setLoadingTasks(false);
  };
  // Fetch projects data
  const fetchProjectsData = async () => {
    setLoadingProjects(true);
    const projectsSnapshot = await getDocs(collection(db, "projects"));
    setProjectCount(projectsSnapshot.size);

    const projectsQuery = query(
      collection(db, "projects"),
      orderBy("createdTime", "desc"),
      limit(10)
    );
    const recentProjectsSnapshot = await getDocs(projectsQuery);
    setRecentProjects(recentProjectsSnapshot.docs.map((doc) => doc.data()));
    setLoadingProjects(false);
  };
  // Fetch teams data
  const fetchTeamsData = async () => {
    setLoadingMembers(true);
    const teamsSnapshot = await getDocs(collection(db, "teams"));
    setTeamCount(teamsSnapshot.size);

    const membersQuery = query(
      collection(db, "members"),
      orderBy("name"),
      limit(10)
    );
    const membersSnapshot = await getDocs(membersQuery);
    setMembers(membersSnapshot.docs.map((doc) => doc.data()));
    setLoadingMembers(false);
  };

  useEffect(() => {
    fetchTasksData();
    fetchProjectsData();
    fetchTeamsData();
  }, []);

  return (
    <div className="p-6 flex-1 overflow-auto">
      <div>
        <div className="grid sm:grid-cols-3 gap-6 mb-6">
          <div className="bg-white border-2 border-solid border-gray-700 p-6 rounded-lg text-center">
            <h3 className="text-lg font-bold">My Task</h3>
            <p className="text-2xl">
              {loadingTasks ? <Skeleton width={50} /> : taskCount}
            </p>
          </div>
          <div className="bg-white border-2 border-solid border-gray-700 p-6 rounded-lg text-center">
            <h3 className="text-lg font-bold">Projects</h3>
            <p className="text-2xl">
              {loadingProjects ? <Skeleton width={50} /> : projectCount}
            </p>
          </div>
          <div className="bg-white border-2 border-solid border-gray-700 p-6 rounded-lg text-center">
            <h3 className="text-lg font-bold">Teams</h3>
            <p className="text-2xl">
              {loadingMembers ? <Skeleton width={50} /> : teamCount}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-white border-2 border-solid border-gray-700 p-6 rounded-lg flex flex-col">
            <h3 className="text-sm font-bold mb-4">Recent Tasks</h3>
            <ul className="flex-grow">
              {loadingTasks
                ? Array(5)
                    .fill()
                    .map((_, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center space-x-2 mb-2"
                      >
                        <Skeleton width={150} height={20} />
                        <Skeleton width={50} height={20} />
                      </li>
                    ))
                : recentTasks.map((task, index) => (
                    <li key={index} className="flex flex-col">
                      <div className="flex justify-between items-center space-x-2">
                        <span className="text-sm truncate flex-grow">
                          {task.taskDescription}
                        </span>
                        <span
                          className={`${
                            task.status === "In Queue"
                              ? "bg-indigo-400"
                              : "bg-green-600"
                          } text-white px-2 py-1 rounded-full text-xs text-center w-20 flex-shrink-0`}
                        >
                          {task.status}
                        </span>
                      </div>
                      <hr className="my-2" />
                    </li>
                  ))}
            </ul>
            <button
              className="mt-4 flex items-center text-blue-600 justify-center"
              onClick={() => router.push("/dashboard/mylist")}
            >
              View All Tasks
            </button>
          </div>

          <div className="bg-white border-2 border-solid border-gray-700 p-6 rounded-lg flex flex-col">
            <h3 className="text-sm font-bold mb-4">Recent Projects</h3>
            <ul className="flex-grow">
              {loadingProjects
                ? Array(5)
                    .fill()
                    .map((_, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center space-x-2 mb-2"
                      >
                        <Skeleton width={150} height={20} />
                        <Skeleton width={50} height={20} />
                      </li>
                    ))
                : recentProjects.map((project, index) => (
                    <li key={index} className="flex flex-col">
                      <div className="flex justify-between items-center space-x-2">
                        <span className="text-sm truncate flex-grow">
                          {project.projectName}
                        </span>
                        <span
                          className={`${
                            project.projectStatus === "Pending"
                              ? "bg-gray-400"
                              : project.projectStatus === "In Progress"
                              ? "bg-green-400"
                              : project.projectStatus === "In Review"
                              ? "bg-yellow-400"
                              : project.projectStatus === "Completed"
                              ? "bg-green-600"
                              : project.projectStatus === "Canceled"
                              ? "bg-red-400"
                              : project.projectStatus === "Due Project"
                              ? "bg-red-600"
                              : "bg-gray-800"
                          } text-white px-2 py-1 rounded-full text-xs text-center w-24 flex-shrink-0`}
                        >
                          {project.projectStatus}
                        </span>
                      </div>
                      <hr className="my-2" />
                    </li>
                  ))}
            </ul>
            <button
              className="mt-4 flex items-center justify-center text-blue-600"
              onClick={() => router.push("/dashboard/projects")}
            >
              View All Projects
            </button>
          </div>

          <div className="bg-white border-2 border-solid border-gray-700 p-6 rounded-lg flex flex-col">
            <h3 className="text-sm font-bold mb-4">All Members</h3>
            <ul className="flex-grow">
              {loadingMembers
                ? Array(5)
                    .fill()
                    .map((_, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center space-x-2 mb-2"
                      >
                        <Skeleton width={150} height={20} />
                        <Skeleton width={50} height={20} />
                      </li>
                    ))
                : members.map((member, index) => (
                    <li key={index} className="flex flex-col">
                      <div className="flex justify-between">
                        <span>{member.name}</span>
                        <span
                          className={`${
                            member.status === "Pending"
                              ? "bg-red-400"
                              : "bg-green-400"
                          } text-white px-2 py-1 rounded-full text-xs text-center w-16`}
                        >
                          {member.status}
                        </span>
                      </div>
                      <hr className="my-2" />
                    </li>
                  ))}
            </ul>
            <button
              className="mt-4 flex items-center text-blue-600 justify-center"
              onClick={() => router.push("/dashboard/members")}
            >
              View All Members
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
