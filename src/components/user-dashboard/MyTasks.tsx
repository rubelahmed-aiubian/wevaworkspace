import { useEffect, useState } from "react";
import { FaSort, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/utils/firebase";
import { IoCheckmark } from "react-icons/io5";

type Task = {
  id: string;
  taskDescription: string;
  dueDate: string | null;
  collaborator: string;
  createdBy: {
    email: string;
    name: string;
    photo?: string;
    position: string;
  };
  status: "In Queue" | "Completed";
};

export default function MyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"task" | "status">("task");
  const [isAscending, setIsAscending] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();
  const { userData } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!userData) return;
      setLoading(true);

      try {
        const tasksRef = collection(db, "tasks");
        const tasksQuery = query(
          tasksRef,
          where("collaborator", "==", userData.email)
        );
        const querySnapshot = await getDocs(tasksQuery);

        const fetchedTasks: Task[] = await Promise.all(
          querySnapshot.docs.map(async (taskDoc) => {
            const task = taskDoc.data() as Task;
            const creatorEmail = task.createdBy; // assuming createdBy is the email string

            // Fetch member data from the members collection
            const memberDocRef = doc(db, "members", creatorEmail);
            const memberDoc = await getDoc(memberDocRef);
            const memberData = memberDoc.exists() ? memberDoc.data() : {};

            return {
              ...task,
              id: taskDoc.id,
              createdBy: {
                email: creatorEmail,
                name: memberData?.name || "Unknown",
                photo: memberData?.photo || null,
                position: memberData?.position || "N/A",
              },
            };
          })
        );

        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userData]);

  const handleSortToggle = (column: "task" | "status") => {
    setIsAscending(column === sortBy ? !isAscending : true);
    setSortBy(column);
  };

  const sortedTask = (a: Task, b: Task) => {
    return isAscending
      ? a.taskDescription.localeCompare(b.taskDescription)
      : b.taskDescription.localeCompare(a.taskDescription);
  };

  const sortedStatus = (a: Task, b: Task) => {
    return isAscending
      ? a.status.localeCompare(b.status)
      : b.status.localeCompare(a.status);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === "task") {
      return sortedTask(a, b);
    } else if (sortBy === "status") {
      return sortedStatus(a, b);
    }
    return 0;
  });

  const paginatedTasks = sortedTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRowClick = (taskId: string) => {
    router.push(`/user-dashboard/mytasks/${taskId}`);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) =>
      prev * itemsPerPage < tasks.length ? prev + 1 : prev
    );
  };

  const formatDueDate = (date: string | null) => {
    if (!date) return "Not Set";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="p-4">
      <div className="rounded-lg overflow-hidden border border-gray-300 bg-white">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th
                className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize flex items-center"
                style={{ width: "45%" }}
              >
                <FaSort
                  className="mr-1 cursor-pointer"
                  onClick={() => handleSortToggle("task")}
                />
                Task
              </th>
              <th
                className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"
                style={{ width: "20%" }}
              >
                Due Date
              </th>
              <th
                className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"
                style={{ width: "20%" }}
              >
                Assigned By
              </th>
              <th
                className="p-5 text-center text-sm leading-6 font-semibold text-gray-900 capitalize"
                style={{ width: "15%" }}
              >
                <div className="flex items-center justify-center">
                  <FaSort
                    className="mr-1 cursor-pointer"
                    onClick={() => handleSortToggle("status")}
                  />
                  Status
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="odd:bg-white even:bg-gray-50">
                  <td className="p-4 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    <Skeleton height={20} width={120} />
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    <Skeleton height={20} width={100} />
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    <Skeleton height={20} width={180} />
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm leading-6 font-medium text-gray-900 text-center">
                    <Skeleton height={20} width={30} />
                  </td>
                </tr>
              ))
            ) : paginatedTasks.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-4">
                  No tasks available.
                </td>
              </tr>
            ) : (
              paginatedTasks.map((task, index) => (
                <tr
                  key={`${task.id}-${index}`}
                  className="odd:bg-white even:bg-gray-50 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleRowClick(task.id)}
                >
                  <td className="border-t border-gray-200 p-2 text-left">
                    <span className="ml-2">{task.taskDescription}</span>
                  </td>
                  <td className="border-t border-gray-200 p-2 text-left">
                    <span className="text-sm">
                      {formatDueDate(task.dueDate)}
                    </span>
                  </td>
                  <td className="border-t border-gray-200 p-2 text-left">
                    <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
                      <img
                        src={
                          task.createdBy.photo
                            ? `/images/users/${task.createdBy.email}/${task.createdBy.photo}`
                            : `/images/users/user.png`
                        }
                        width={50}
                        height={50}
                        alt={task.createdBy.name || "Assigned By"}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span className="text-sm pr-2">
                        {task.createdBy.name || "N/A"}{" "}
                      </span>
                    </div>
                  </td>
                  <td className="border-t border-gray-200 p-2 text-center flex justify-center">
                    <IoCheckmark
                      className={`border border-gray-300 rounded-full p-1 text-2xl ${
                        task.status === "Completed"
                          ? "text-white bg-green-500 border-0"
                          : "text-gray-500"
                      }`}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="flex flex-col items-center mt-4">
        <span className="text-sm text-gray-700 dark:text-gray-400">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, tasks.length)} of {tasks.length}{" "}
          tasks
        </span>
        <div className="inline-flex mt-2 xs:mt-0">
          {tasks.length > itemsPerPage && (
            <>
              <button
                onClick={handlePreviousPage}
                className="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900"
                disabled={currentPage === 1}
              >
                <FaChevronLeft className="me-2" /> Prev
              </button>
              <button
                onClick={handleNextPage}
                className="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-gray-800 border-0 border-s border-gray-700 rounded-e hover:bg-gray-900"
                disabled={currentPage * itemsPerPage >= tasks.length}
              >
                Next <FaChevronRight className="ms-2" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
