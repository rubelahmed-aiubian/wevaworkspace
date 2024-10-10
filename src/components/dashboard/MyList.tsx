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
import {FaTrash, FaCheck, FaFilter, FaSort, FaChevronRight } from "react-icons/fa";
import SingleTaskView from './SingleTaskView';
import 'react-loading-skeleton/dist/skeleton.css';

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
  const [lastTaskId, setLastTaskId] = useState(0);
  const [localTasks, setLocalTasks] = useState([]);
  const itemsPerPage = 10; //items per page
  const LOCAL_STORAGE_KEY = `tasks_${user}`;
  const router = useRouter();
  
  //add buttoon
  const handleAddTaskClick = () => {
    if (taskInputRef.current) {
      taskInputRef.current.focus();
    }
  };
  //load from loal storage for instant display
  const loadTasksFromLocalStorage = () => {
    const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedTasks ? JSON.parse(storedTasks) : [];
  };
  //save to local storage
  const saveTasksToLocalStorage = (tasksList) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasksList));
    setLocalTasks(tasksList);
  };
  //Loading Tasklist
useEffect(() => {
  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch tasks
      let localTasks = loadTasksFromLocalStorage();
      if (localTasks.length > 0) setTasks(sortTasks(localTasks));
      
      const tasksRef = collection(db, "tasks", user, "userTasks");
      const tasksSnapshot = await getDocs(tasksRef);

      let tasksList = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      tasksList = sortTasks(tasksList);
      if (statusFilter) tasksList = tasksList.filter(task => task.status === statusFilter);
      setTasks(tasksList);
      saveTasksToLocalStorage(tasksList);

      // Fetch collaborators
      const membersRef = collection(db, "members");
      const q = query(membersRef, where("position", "!=", "Admin"));
      const querySnapshot = await getDocs(q);

      const collaboratorsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setCollaboratorOptions(collaboratorsList);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [user, statusFilter, sortOrder]);
  
  //Pressing enter to submit
  const handleTaskSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && task.trim()) {
      const newId = (lastTaskId % 999) + 1;
      setLastTaskId(newId);

      const newTask = {
        id: newId.toString().padStart(3, '0'),
        taskDescription: task,
        dueDate: dueDate || null,
        collaborator: collaborator || null,
        status: "In Queue",
        email: user,
        createdAt: new Date().toISOString(),
      };

      // Update local state and storage immediately
      const updatedTasks = [newTask, ...tasks];
      setTasks(updatedTasks);
      saveTasksToLocalStorage(updatedTasks);

      setTask("");
      setDueDate("");
      setCollaborator("");

      try {
        const userDocRef = doc(db, "members", user);
        const userDocSnapshot = await getDoc(userDocRef);
        if (!userDocSnapshot.exists()) {
          console.error("User does not exist in members collection.");
          return;
        }

        const tasksDocRef = doc(db, "tasks", user);
        const tasksDocSnapshot = await getDoc(tasksDocRef);
        if (!tasksDocSnapshot.exists()) {
          await setDoc(tasksDocRef, {});
        }

        const tasksCollectionRef = collection(tasksDocRef, "userTasks");
        await setDoc(doc(tasksCollectionRef, newTask.id), newTask);
        
        // No need to update the task with a Firebase-generated ID
      } catch (error) {
        console.error("Error adding task to Firebase: ", error);
      }
    }
  };
  //pagination control
  const isNextPageAvailable = currentPage < Math.ceil(tasks.length / itemsPerPage);
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
  // Paginate tasks
  const paginatedTasks = tasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Changing toggle
  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  //sort fucntion
  const sortTasks = (tasks) => {
    return tasks.sort((a, b) => {
      return sortOrder === "desc"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt);
    });
  };

  //complete task
  const handleCompleteTask = async (taskId: string) => {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;

    const newStatus = taskToUpdate.status === "Completed" ? "In Queue" : "Completed";
    
    // Update local state
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);

    // Update drawer task if it's the current task
    if (drawerTask && drawerTask.id === taskId) {
      setDrawerTask({ ...drawerTask, status: newStatus });
    }

    // Update local storage
    saveTasksToLocalStorage(updatedTasks);

    // Update Firestore
    try {
      const taskDocRef = doc(db, "tasks", user, "userTasks", taskId);
      await updateDoc(taskDocRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating task status in Firestore:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setIsDeleting(true);

      // Remove from UI
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      saveTasksToLocalStorage(updatedTasks);

      // Remove from Firebase
      const taskDocRef = doc(db, "tasks", user, "userTasks", taskId);
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

  const handleUpdateDescription = async (taskId, newDescription) => {
    try {
      // Update the task in the local state
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, taskDescription: newDescription } : task
      );
      setTasks(updatedTasks);
      saveTasksToLocalStorage(updatedTasks);

      // Update the task in Firebase
      const taskDocRef = doc(db, "tasks", user, "userTasks", taskId);
      await setDoc(taskDocRef, { taskDescription: newDescription }, { merge: true });
    } catch (error) {
      console.error("Error updating task description: ", error);
    }
  };

  const handleUpdateDueDate = async (taskId: string, newDueDate: string | null) => {
    try {
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, dueDate: newDueDate } : task
      );
      setTasks(updatedTasks);
      saveTasksToLocalStorage(updatedTasks);

      const taskDocRef = doc(db, "tasks", user, "userTasks", taskId);
      await setDoc(taskDocRef, { dueDate: newDueDate }, { merge: true });
    } catch (error) {
      console.error("Error updating task due date: ", error);
    }
  };

const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : null;

const handleOpenDrawer = async (taskId: string) => {
  setIsDrawerLoading(true);
  setSelectedTaskId(taskId);
  setIsDrawerOpen(true);

  // First, check local storage
  const localTask = localTasks.find(task => task.id === taskId);
  if (localTask) {
    // console.log("Task found in local storage:", localTask);
    setDrawerTask(localTask);
    setIsDrawerLoading(false);
    return;
  }

  // If not in local storage, fetch from Firestore
  try {
    console.log("Fetching task with ID:", taskId);
    const taskDocRef = doc(db, "tasks", user, "userTasks", taskId);
    const taskDocSnapshot = await getDoc(taskDocRef);
    
    if (taskDocSnapshot.exists()) {
      const taskData = { id: taskDocSnapshot.id, ...taskDocSnapshot.data() };
      console.log("Task data fetched from Firestore:", taskData);
      setDrawerTask(taskData);
    } else {
      console.error("Task not found in Firestore:", taskId);
      setDrawerTask(null);
    }
  } catch (error) {
    console.error("Error fetching task:", error);
    setDrawerTask(null);
  } finally {
    setIsDrawerLoading(false);
  }
};

  const handleUpdateCollaborator = async (taskId: string, newCollaborator: string | null) => {
    // Update local state
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, collaborator: newCollaborator } : task
    );
    setTasks(updatedTasks);

    // Update drawer task if it's the current task
    if (drawerTask && drawerTask.id === taskId) {
      setDrawerTask({ ...drawerTask, collaborator: newCollaborator });
    }

    // Update local storage
    saveTasksToLocalStorage(updatedTasks);

    // Update Firestore
    try {
      const taskDocRef = doc(db, "tasks", user, "userTasks", taskId);
      await updateDoc(taskDocRef, { collaborator: newCollaborator });
    } catch (error) {
      console.error("Error updating task collaborator in Firestore:", error);
    }
  };

  const handleUpdateSummary = async (taskId: string, newSummary: string) => {
    try {
      // Update the task in the local state
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, summary: newSummary } : task
      );
      setTasks(updatedTasks);
      saveTasksToLocalStorage(updatedTasks);

      // Update drawer task if it's the current task
      if (drawerTask && drawerTask.id === taskId) {
        setDrawerTask({ ...drawerTask, summary: newSummary });
      }

      // Update the task in Firebase
      const taskDocRef = doc(db, "tasks", user, "userTasks", taskId);
      await setDoc(taskDocRef, { summary: newSummary }, { merge: true });
    } catch (error) {
      console.error("Error updating task summary: ", error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <button
          className="bg-gray-900 text-white px-4 py-2 rounded"
          onClick={handleAddTaskClick}
        >
          Add New Task
        </button>
        <div className="flex items-center gap-4">
          <FaFilter />
          <select
            className="p-2 border border-gray-300 rounded"
            value={statusFilter} // Bind to state
            onChange={(e) => setStatusFilter(e.target.value)} // Update filter on change
          >
            <option value="">All</option>{" "}
            {/* This will represent the "All" option */}
            <option value="In Queue">In Queue</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-100 rounded shadow p-4 mb-4 flex gap-4">
        <input
          ref={taskInputRef}
          type="text"
          placeholder="Add new task..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={handleTaskSubmit}
          className="w-2/4 p-2 border border-gray-300 rounded focus:border-gray-400"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-1/4 p-2 border border-gray-300 rounded focus:border-gray-400"
        />
        <select
          value={collaborator}
          onChange={(e) => setCollaborator(e.target.value)}
          className="w-1/4 p-2 border border-gray-300 rounded focus:border-gray-400"
        >
          <option value="">Select Collaborator</option>
          {collaboratorOptions.map((member) => (
            <option key={member.id} value={member.name}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      <table className="w-full border-collapse">
        <thead className="text-left">
          <tr>
            <th className="border-gray-300 font-semibold p-2 w-6/12 flex items-center">
              <FaSort
                className="mr-1 cursor-pointer"
                onClick={handleSortToggle}
              />
              Task
            </th>
            <th className="border-gray-300 font-semibold p-2 w-2/12 text-left">
              Due Date
            </th>
            <th className="border-gray-300 font-semibold p-2 w-2/12 text-left">
              Collaborator
            </th>
            <th className="border-gray-300 font-semibold p-2 w-2/12 text-center">
              Details
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="text-left">
                <td className="border-t border-gray-200 p-2">
                  <Skeleton height={20} width={300} />
                </td>
                <td className="border-t border-gray-200 p-2">
                  <Skeleton height={20} width={120} />
                </td>
                <td className="border-t border-gray-200 p-2">
                  <Skeleton height={20} width={120} />
                </td>
                <td className="border-t border-gray-200 p-2 text-center">
                  <Skeleton height={20} width={30} />
                </td>
              </tr>
            ))
          ) : tasks.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="text-center border-t border-gray-200 p-2"
              >
                No tasks available.
              </td>
            </tr>
          ) : (
            paginatedTasks.map((task, index) => (
              <tr key={index} className="text-center">
                <td className="border-t border-gray-200 p-2 text-left">
                  <FaCheck
                    className={`${
                      task.status === "Completed"
                        ? "bg-teal-500 text-white"
                        : "text-gray-700 bg-gray-200 hover:bg-teal-500 hover:text-white"
                    } rounded-full p-1 text-xl cursor-pointer inline`}
                    onClick={() => handleCompleteTask(task.id)}
                  />
                  <span className="ml-2">
                    {task.status === "Completed" ? (
                      <del>{task.taskDescription}</del>
                    ) : (
                      task.taskDescription
                    )}
                  </span>
                </td>
                <td className="border-t border-gray-200 p-2 text-left">
                  {task.dueDate ? formatDate(task.dueDate) : "No due date"}
                </td>
                <td className="border-t border-gray-200 p-2 text-left">
                  <span className="bg-gray-900 rounded-full px-3 py-1 text-white text-sm">
                    {task.collaborator ? task.collaborator : "None"}
                  </span>
                </td>
                <td className="border-t border-gray-200 p-2 text-left">
                  <FaChevronRight
                    className="cursor-pointer bg-teal-500 p-2 text-3xl text-white mx-auto"
                    onClick={() => handleOpenDrawer(task.id)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ---------Single List Drawer----------- */}
      <div
        className={`fixed inset-0 ${
          isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => !isDeleting && setIsDrawerOpen(false)}
      />
      <div
        className={`fixed right-0 bottom-0 w-3/4 md:w-1/3 bg-white h-full shadow-md transition-transform transform z-10 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          height: 'calc(100vh - 4rem)',
          overflowY: 'auto'
        }}
      >
        {isDeleting ? (
          <div className="flex items-center justify-center h-full">
            <FaTrash className="text-red-500 text-xl mr-2" />
            <p className="text-2xl font-bold text-red-500">Deleted</p>
            
          </div>
        ) : (
          isDrawerOpen && selectedTaskId && (
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

      {/* --------------Pagination aread----------------- */}
      <div className="flex justify-between items-center my-4 border-t border-gray-200 pt-2">
        <span>
          Page {currentPage} of {Math.ceil(tasks.length / itemsPerPage)}
        </span>
        <div>
          <button
            onClick={handlePreviousPage}
            disabled={!isPreviousPageAvailable}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={!isNextPageAvailable}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 ml-2"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}