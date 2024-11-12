//src/components/dashboard/MyList.tsx
"use client";
import { db } from "@/utils/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import { useAuth } from "@/context/AuthContext";
import React, { useRef, useState, useEffect } from "react";
import {
  FaTrash,
  FaFilter,
  FaSort,
  FaChevronRight,
  FaChevronLeft,
} from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { IoCheckmark } from "react-icons/io5";
import { v4 as uuidv4 } from "uuid"; // Import uuid
import Image from "next/image";

import SingleTaskView from "./SingleTaskView";
import "react-loading-skeleton/dist/skeleton.css";

export default function MyList() {
  const { user } = useAuth();
  const taskInputRef = useRef(null);
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("");
  const [collaborator, setCollaborator] = useState("");
  const [collaboratorOptions, setCollaboratorOptions] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  const [drawerTask, setDrawerTask] = useState(null);
  const [localTasks, setLocalTasks] = useState([]);
  const itemsPerPage = 8; //items per page
  const LOCAL_STORAGE_KEY = `tasks_${user}`;
  const router = useRouter();

  // New function to handle adding tasks
  const addTask = async (newTask) => {
    const newTaskId = uuidv4().slice(0, 16);
    const updatedTasks = [{ id: newTaskId, ...newTask }, ...tasks];
    setTasks(updatedTasks);
    saveTasksToSessionStorage(updatedTasks);

    try {
      const tasksCollectionRef = collection(db, "tasks"); // Directly reference the "tasks" collection
      const taskDocRef = doc(tasksCollectionRef, newTaskId); // Use newTaskId as the document ID
      await setDoc(taskDocRef, newTask); // Store the task without the id
    } catch (error) {
      console.error("Error adding task to Firebase: ", error);
    }
  };

  //add buttoon
  const handleAddTaskClick = async () => {
    if (!task.trim()) {
      taskInputRef.current.focus();
      return;
    }

    setIsDrawerLoading(true);

    const newTask = {
      taskDescription: task,
      dueDate: dueDate || null,
      collaborator: collaborator ? collaborator.id : null,
      status: "In Queue",
      createdBy: user,
      createdAt: new Date().toISOString(),
    };

    await addTask(newTask); // Call the new function

    // Clear input fields after adding
    setTask("");
    setDueDate("");
    setCollaborator("");
  };

  // Save to session storage
  const saveTasksToSessionStorage = (tasksList) => {
    sessionStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasksList));
    setLocalTasks(tasksList);
  };

  // Load tasks from Firestore
  const loadTasksFromFirestore = async () => {
    if (!user) return;

    setLoading(true); // Set loading to true before fetching

    try {
      const tasksRef = collection(db, "tasks");
      const tasksSnapshot = await getDocs(tasksRef);

      const tasksList = await Promise.all(
        tasksSnapshot.docs.map(async (doc) => {
          const taskData = { id: doc.id, ...doc.data() };

          // Fetch collaborator details if available
          if (taskData.collaborator) {
            const collaboratorEmail = taskData.collaborator; // Assuming this holds the email
            const membersRef = collection(db, "members");
            const q = query(
              membersRef,
              where("email", "==", collaboratorEmail)
            );
            const memberSnapshot = await getDocs(q);
            const memberData = memberSnapshot.docs[0]?.data();

            // Create collaborator object
            taskData.collaborator = memberData
              ? {
                  email: memberData.email,
                  name: memberData.name,
                  photo: memberData.photo,
                  position: memberData.position,
                }
              : null; // Set to null if no member found
          }

          return taskData;
        })
      );

      setTasks(tasksList);
      saveTasksToSessionStorage(tasksList);
    } catch (error) {
      console.error("Error loading tasks from Firestore: ", error);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  // Function to load collaborator options from the members collection
  const loadCollaboratorOptions = async () => {
    try {
      const membersRef = collection(db, "members");
      const membersSnapshot = await getDocs(membersRef);

      const membersList = membersSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          photo: doc.data().photo,
          email: doc.data().email,
          position: doc.data().position,
        }))
        .filter((member) => member.position !== "Admin"); // Filter out Admins

      console.log("Fetched Collaborator Options:", membersList); // Log the fetched members

      setCollaboratorOptions(membersList);
    } catch (error) {
      console.error(
        "Error loading collaborator options from Firestore: ",
        error
      );
    }
  };

  // Load tasks and collaborator options when the user changes
  useEffect(() => {
    loadTasksFromFirestore();
    loadCollaboratorOptions(); // Fetch collaborator options
  }, [user]);

  // Pressing enter to submit
  const handleTaskSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && task.trim()) {
      const newTask = {
        taskDescription: task,
        dueDate: dueDate || null,
        collaborator: collaborator ? collaborator.id : null,
        status: "In Queue",
        createdBy: user,
        createdAt: new Date().toISOString(),
      };

      await addTask(newTask); // Call the new function

      // Clear input fields after adding
      setTask("");
      setDueDate("");
      setCollaborator("");
    }
  };
  //pagination control
  const isNextPageAvailable =
    currentPage < Math.ceil(tasks.length / itemsPerPage);
  const isPreviousPageAvailable = currentPage > 1;

  const handleNextPage = () => {
    if (isNextPageAvailable) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      router.push(`/dashboard/mylist?page=${nextPage}`); // Update URL
    }
  };

  const handlePreviousPage = () => {
    if (isPreviousPageAvailable) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      router.push(`/dashboard/mylist?page=${prevPage}`); // Update URL
    }
  };

  // Changing toggle
  const handleSortToggle = () => {
    setSortOrder((prev) => {
      const newOrder = prev === "desc" ? "asc" : "desc";
      const sortedTasks = sortTasks(tasks); // Sort tasks based on the new order
      setTasks(sortedTasks); // Update the tasks state with sorted tasks
      return newOrder; // Return the new sort order
    });
  };

  //sort fucntion
  const sortTasks = (tasks) => {
    return tasks.sort((a, b) => {
      return sortOrder === "desc"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt);
    });
  };

  // Complete task
  const handleCompleteTask = async (taskId: string) => {
    const taskToUpdate = tasks.find((task) => task.id === taskId);
    if (!taskToUpdate) return;

    const newStatus =
      taskToUpdate.status === "Completed" ? "In Queue" : "Completed";

    // Update local state
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);
    saveTasksToSessionStorage(updatedTasks);

    // Update Firestore
    try {
      const taskDocRef = doc(db, "tasks", taskId);
      await updateDoc(taskDocRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating task status in Firestore:", error);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    try {
      setIsDeleting(true);

      // Remove from UI
      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      setTasks(updatedTasks);
      saveTasksToSessionStorage(updatedTasks);

      // Remove from Firestore
      const taskDocRef = doc(db, "tasks", taskId);
      await deleteDoc(taskDocRef);

      // Wait for a short delay before closing the drawer
      setTimeout(() => {
        setIsDeleting(false);
        setIsDrawerOpen(false);
        setSelectedTaskId(null);
      }, 1000); // Adjust this delay as needed
    } catch (error) {
      console.error("Error deleting task: ", error);
      setIsDeleting(false);
    }
  };

  // Update task description
  const handleUpdateDescription = async (
    taskId: string,
    newDescription: string
  ) => {
    try {
      // Update the task in the local state
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, taskDescription: newDescription } : task
      );
      setTasks(updatedTasks);
      saveTasksToSessionStorage(updatedTasks);

      // Update the task in Firestore
      const taskDocRef = doc(db, "tasks", taskId);
      await setDoc(
        taskDocRef,
        { taskDescription: newDescription },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating task description: ", error);
    }
  };

  // Update task due date
  const handleUpdateDueDate = async (
    taskId: string,
    newDueDate: string | null
  ) => {
    try {
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, dueDate: newDueDate } : task
      );
      setTasks(updatedTasks);
      saveTasksToSessionStorage(updatedTasks);

      const taskDocRef = doc(db, "tasks", taskId);
      await setDoc(taskDocRef, { dueDate: newDueDate }, { merge: true });
    } catch (error) {
      console.error("Error updating task due date: ", error);
    }
  };

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        })
      : null;

  const handleOpenDrawer = async (taskId: string) => {
    setIsDrawerLoading(true);
    setSelectedTaskId(taskId);
    setIsDrawerOpen(true);

    // Check local storage first
    const localTask = localTasks.find((task) => task.id === taskId);
    if (localTask) {
      setDrawerTask(localTask);
      setIsDrawerLoading(false);
      return;
    }

    // If not found locally, fetch from Firestore
    useEffect(() => {
      const fetchTask = async () => {
        try {
          const taskDocRef = doc(db, "tasks", user, "userTasks", taskId);
          const taskDocSnapshot = await getDoc(taskDocRef);

          if (taskDocSnapshot.exists()) {
            const taskData = {
              id: taskDocSnapshot.id,
              ...taskDocSnapshot.data(),
            };
            setDrawerTask(taskData);
          } else {
            setDrawerTask(null); // Handle missing task
          }
        } catch (error) {
          console.error("Error fetching task:", error);
          setDrawerTask(null); // Handle errors
        } finally {
          setIsDrawerLoading(false);
        }
      };

      fetchTask();
    }, [taskId]);
  };

  // Update collaborator
  const handleUpdateCollaborator = async (
    taskId: string,
    newCollaborator: {
      id: string;
      name: string;
      photo: string;
      position: string;
    } | null
  ) => {
    // Update local state
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? { ...task, collaborator: newCollaborator || null }
        : task
    );
    setTasks(updatedTasks);
    saveTasksToSessionStorage(updatedTasks);

    // Update Firestore
    try {
      const taskDocRef = doc(db, "tasks", taskId);
      await updateDoc(taskDocRef, {
        collaborator: newCollaborator ? newCollaborator.id : null,
      });
    } catch (error) {
      console.error("Error updating task collaborator in Firestore:", error);
    }
  };
  //update summery
  const handleUpdateSummary = async (taskId: string, newSummary: string) => {
    try {
      // Update the task in the local state
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, summary: newSummary } : task
      );
      setTasks(updatedTasks);
      saveTasksToSessionStorage(updatedTasks); // Changed to session storage

      // Update drawer task if it's the current task
      if (drawerTask && drawerTask.id === taskId) {
        setDrawerTask({ ...drawerTask, summary: newSummary });
      }

      // Update the task in Firebase
      const taskDocRef = doc(db, "tasks", taskId); // Adjusted to match the new structure
      await setDoc(taskDocRef, { summary: newSummary }, { merge: true });
    } catch (error) {
      console.error("Error updating task summary: ", error);
    }
  };

  // Filter tasks based on the selected status
  const filteredTasks = tasks.filter((task) => {
    if (!statusFilter) return true; // If no filter is selected, show all tasks
    return task.status === statusFilter; // Filter by status
  });

  // Paginate filtered tasks
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4">
      <div className="bg-gray-100 rounded shadow p-4 mb-4 flex gap-4">
        <button
          className="bg-gray-900 text-white px-4 py-2 rounded flex items-center justify-center"
          onClick={handleAddTaskClick}
          disabled={isDrawerLoading}
        >
          Add Task
        </button>
        <input
          ref={taskInputRef}
          type="text"
          placeholder="Enter task here..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={handleTaskSubmit}
          className="p-2 border border-gray-300 rounded focus:border-gray-400 flex-grow"
        />
        {/* Filter */}
        <div className="flex items-center gap-4 ml-auto">
          <FaFilter />
          <select
            className="p-2 border border-gray-300 rounded"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="In Queue">In Queue</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>
      <div className="rounded-lg overflow-hidden border border-gray-300 bg-white">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th
                scope="col"
                className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize flex items-center"
                style={{ width: "45%" }}
              >
                <FaSort
                  className="mr-1 cursor-pointer"
                  onClick={handleSortToggle}
                />
                Task
              </th>
              <th
                scope="col"
                className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"
                style={{ width: "20%" }}
              >
                Due Date
              </th>
              <th
                scope="col"
                className="p-5 text-left text-sm leading-6 font-semibold text-gray-900 capitalize"
                style={{ width: "20%" }}
              >
                Collaborator
              </th>
              <th
                scope="col"
                className="p-5 text-center text-sm leading-6 font-semibold text-gray-900 capitalize"
                style={{ width: "15%" }}
              >
                Action
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
                  onClick={() => handleOpenDrawer(task.id)}
                >
                  <td className="border-t border-gray-200 p-2 text-left">
                    <span className="ml-2">
                      {task.status === "Completed" ? (
                        <del>{task.taskDescription}</del>
                      ) : (
                        task.taskDescription
                      )}
                    </span>
                  </td>
                  <td className="border-t border-gray-200 p-2 text-left">
                    <div
                      className="inline-flex items-center bg-gray-200 rounded-full px-4 py-1 text-black text-md cursor-pointer"
                      onClick={() => !task.dueDate && handleOpenDrawer(task.id)}
                    >
                      {task.dueDate ? (
                        <span className="text-sm">
                          {formatDate(task.dueDate)}
                        </span>
                      ) : (
                        <span className="text-blue-600 text-sm">Add Date</span>
                      )}
                    </div>
                  </td>
                  <td className="border-t border-gray-200 p-2 text-left">
                    <div
                      className="inline-flex items-center bg-gray-200 rounded-full px-2 py-1 text-black text-md cursor-pointer"
                      onClick={() =>
                        !task.collaborator && handleOpenDrawer(task.id)
                      }
                    >
                      {task.collaborator ? (
                        <>
                          <Image
                            src={
                              task.collaborator.photo
                                ? `/images/users/${task.collaborator.email}/${task.collaborator.photo}`
                                : `/images/users/user.png`
                            }
                            width={50}
                            height={50}
                            alt={
                              task.collaborator.name
                                ? task.collaborator.name
                                : "Collaborator"
                            }
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          <span className="text-sm pr-2">
                            {task.collaborator.name}
                          </span>
                        </>
                      ) : (
                        <span className="text-blue-600 text-sm cursor-pointer px-2">
                          Add Collaborator
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="flex justify-center items-center border-t border-gray-200 p-2 h-16">
                    <IoCheckmark
                      className={`cursor-pointer border border-gray-300 rounded-full p-1 text-2xl hover:bg-green-500 hover:text-white transition-all duration-300 ${
                        task.status === "Completed"
                          ? "text-white bg-green-500 border-0"
                          : "text-gray-500"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent drawer from opening
                        handleCompleteTask(task.id); // Handle complete task
                      }}
                    />
                    <RxCross2
                      className="text-red-400 ml-2 cursor-pointer border border-gray-300 rounded-full p-1 text-2xl hover:bg-red-500 hover:text-white transition-all duration-300"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent drawer from opening
                        handleDeleteTask(task.id); // Handle delete task
                      }}
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
                disabled={!isPreviousPageAvailable}
              >
                <FaChevronLeft className="me-2" /> Prev
              </button>
              <button
                onClick={handleNextPage}
                className="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-gray-800 border-0 border-s border-gray-700 rounded-e hover:bg-gray-900"
                disabled={!isNextPageAvailable}
              >
                Next <FaChevronRight className="ms-2" />
              </button>
            </>
          )}
        </div>
      </div>
      {/* ---------Single List Drawer----------- */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-50" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => !isDeleting && setIsDrawerOpen(false)}
      />
      <div
        className={`fixed right-0 bottom-0 w-9/12 md:w-4/12 bg-white h-full shadow-md transition-transform transform z-10 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          height: "calc(100vh - 4rem)",
          overflowY: "auto",
        }}
      >
        {isDeleting ? (
          <div className="flex items-center justify-center h-full">
            <FaTrash className="text-red-500 text-xl mr-2" />
            <p className="text-2xl font-bold text-red-500">Deleted</p>
          </div>
        ) : (
          isDrawerOpen &&
          selectedTaskId && (
            <SingleTaskView
              task={drawerTask}
              isLoading={isDrawerLoading}
              onClose={() => setIsDrawerOpen(false)}
              onComplete={handleCompleteTask}
              onDelete={handleDeleteTask}
              onUpdateDescription={handleUpdateDescription}
              onUpdateDueDate={handleUpdateDueDate}
              onUpdateCollaborator={handleUpdateCollaborator}
              onUpdateSummary={handleUpdateSummary}
              collaboratorOptions={collaboratorOptions}
            />
          )
        )}
      </div>
    </div>
  );
}
