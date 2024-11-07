// UserDashboardContent.tsx
import { useEffect, useState } from "react";
import { db } from "@/utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAuth } from "@/context/AuthContext";

export default function UserDashboardContent() {
  const { userData } = useAuth();
  const [taskCount, setTaskCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const router = useRouter();

  // Fetch tasks data
  const fetchTasksData = async () => {
    if (!userData) return;

    setLoadingTasks(true);
    const userTasksRef = collection(db, "tasks");
    const userTasksSnapshot = await getDocs(userTasksRef);

    const userTasks = userTasksSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((task) => task.collaborator === userData.email);

    setRecentTasks(userTasks.slice(0, 10));
    setTaskCount(userTasks.length); // Update task count
    setLoadingTasks(false);
  };

  // Fetch projects data
  const fetchProjectsData = async () => {
    setLoadingProjects(true);
    const projectsSnapshot = await getDocs(collection(db, "projects"));
    const allProjects = projectsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Fetch teams data to check members
    const teamsSnapshot = await getDocs(collection(db, "teams"));
    const allTeams = teamsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter projects for the logged-in user
    const userProjects = allProjects.filter(
      (project) =>
        Array.isArray(project.assignedTeam) && // Check if assignedTeam is an array
        project.assignedTeam.some((teamId) => {
          const team = allTeams.find((t) => t.id === teamId);
          return team && team.members.includes(userData.email); // Check if user's email is in the team's members
        })
    );

    setProjectCount(userProjects.length);
    setRecentProjects(userProjects.slice(0, 10));
    setLoadingProjects(false);
  };

  // Fetch teams data
  const fetchTeamsData = async () => {
    setLoadingTeams(true);
    const teamsSnapshot = await getDocs(collection(db, "teams"));
    const allTeams = teamsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter teams for the logged-in user
    const userTeams = allTeams.filter(
      (team) => team.members && team.members.includes(userData.email) // Check if user's email is in the team's members
    );

    setTeamCount(userTeams.length);
    setTeams(userTeams); // Set the filtered teams
    setLoadingTeams(false);
  };

  useEffect(() => {
    fetchTasksData();
    fetchProjectsData();
    fetchTeamsData();
  }, [userData]);

  return (
    <div className="p-6 flex-1 overflow-auto">
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-solid border-gray-700 p-6 rounded-lg flex flex-col">
          <h3 className="text-sm font-bold mb-4">
            Assigned Tasks{" "}
            <span className="text-xs text-gray-500">({taskCount})</span>
          </h3>
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
              : recentTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex flex-col cursor-pointer"
                    onClick={() =>
                      router.push(`/user-dashboard/mytasks/${task.id}`)
                    }
                  >
                    <div className="flex justify-between items-center space-x-2 pb-2">
                      <span className="text-sm truncate flex-grow hover:text-indigo-600">
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
                  </li>
                ))}
          </ul>
          <button
            className="mt-4 flex items-center text-blue-600 justify-center"
            onClick={() => router.push("user-dashboard/mytasks")}
          >
            View All Tasks
          </button>
        </div>

        <div className="bg-white border-2 border-solid border-gray-700 p-6 rounded-lg flex flex-col">
          <h3 className="text-sm font-bold mb-4">
            Assigned Projects{" "}
            <span className="text-xs text-gray-500">({projectCount})</span>
          </h3>
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
              : recentProjects.map((project) => (
                  <li
                    key={project.id}
                    className="flex flex-col cursor-pointer"
                    onClick={() =>
                      router.push(`/user-dashboard/myprojects/${project.id}`)
                    }
                  >
                    <div className="flex justify-between items-center space-x-2 pb-2">
                      <span className="text-sm truncate flex-grow hover:text-indigo-600">
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
                  </li>
                ))}
          </ul>
          <button
            className="mt-4 flex items-center text-blue-600 justify-center"
            onClick={() => router.push("user-dashboard/myprojects")}
          >
            View All Projects
          </button>
        </div>

        <div className="bg-white border-2 border-solid border-gray-700 p-6 rounded-lg flex flex-col">
          <h3 className="text-sm font-bold mb-4">
            My Teams{" "}
            <span className="text-xs text-gray-500">({teamCount})</span>
          </h3>
          <ul className="flex-grow">
            {loadingTeams
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
              : teams.map((team) => (
                  <li
                    key={team.id}
                    className="flex flex-col cursor-pointer"
                    onClick={() =>
                      router.push(`/user-dashboard/myteams/${team.id}`)
                    }
                  >
                    <div className="flex justify-between items-center space-x-2 pb-2">
                      <span className="text-sm truncate flex-grow hover:text-indigo-600">
                        {team.teamName}
                      </span>
                      <span
                        className={`${
                          team.teamStatus === "Disabled"
                            ? "bg-red-400"
                            : "bg-green-400"
                        } text-white px-2 py-1 rounded-full text-xs text-center w-16`}
                      >
                        {team.teamStatus}
                      </span>
                    </div>
                  </li>
                ))}
          </ul>
          <button
            className="mt-4 flex items-center text-blue-600 justify-center"
            onClick={() => router.push("user-dashboard/myteams")}
          >
            View All Teams
          </button>
        </div>
      </div>
    </div>
  );
}
