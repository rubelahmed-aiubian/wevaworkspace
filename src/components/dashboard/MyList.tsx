"use client";
import { db } from "@/utils/firebase";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import { useAuth } from "@/context/AuthContext";
import React, { useRef, useState, useEffect } from "react";
import { FaCheck, FaFilter, FaSort, FaChevronRight } from "react-icons/fa";

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
  const [selectedTask, setSelectedTask] = useState(null);

  const itemsPerPage = 5; //items per page
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
    const localTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
    return localTasks ? JSON.parse(localTasks) : [];
  };
  //save to local storage
  const saveTasksToLocalStorage = (tasksList) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasksList));
  };
  //Loading Tasklist
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;

      setLoading(true);
      let localTasks = loadTasksFromLocalStorage();
      localTasks = sortTasks(localTasks); // Sort local tasks

      if (localTasks.length > 0) {
        setTasks(localTasks);
      }

      try {
        const tasksRef = collection(db, "tasks", user, "userTasks");
        const tasksSnapshot = await getDocs(tasksRef);

        let tasksList = [];
        tasksSnapshot.forEach((doc) => {
          tasksList.push({ id: doc.id, ...doc.data() });
        });

        // Sort tasks from Firestore
        tasksList = sortTasks(tasksList);

        // Filter tasks by status if a status is selected
        if (statusFilter) {
          tasksList = tasksList.filter((task) => task.status === statusFilter);
        }

        setTasks(tasksList);
        saveTasksToLocalStorage(tasksList);
      } catch (error) {
        console.error("Error fetching tasks: ", error);
      }

      setLoading(false);
    };

    fetchTasks();
  }, [user, sortOrder, statusFilter]);

  //Fetching collaborators
  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const membersRef = collection(db, "members");
        const q = query(membersRef, where("position", "!=", "Admin"));
        const querySnapshot = await getDocs(q);

        const collaboratorsList = [];
        querySnapshot.forEach((doc) => {
          collaboratorsList.push({
            id: doc.id,
            name: doc.data().name,
          });
        });

        setCollaboratorOptions(collaboratorsList);
      } catch (error) {
        console.error("Error fetching collaborators: ", error);
      }
    };

    fetchCollaborators();
  }, []);
  //Pressing enter to submit
  const handleTaskSubmit = async (e) => {
    if (e.key === "Enter" && task.trim()) {
      const newTask = {
        taskDescription: task,
        dueDate: dueDate || new Date().toISOString().slice(0, 10),
        collaborator: collaborator || null,
        status: "In Queue",
        email: user,
        createdAt: new Date().toISOString(), // Add this line
      };

      const updatedTasks = [newTask, ...tasks]; // Add new task at the start
      setTasks(updatedTasks);
      saveTasksToLocalStorage(updatedTasks);

      // Clear input fields after updating local storage
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
        await addDoc(tasksCollectionRef, newTask);
      } catch (error) {
        console.error("Error adding task to Firebase: ", error);
      }
    }
  };
  //pagination control
  const handleNextPage = () => {
    if (currentPage < Math.ceil(tasks.length / itemsPerPage)) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      router.push(`/dashboard/mylist?page=${nextPage}`); // Update URL
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
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
  const handleCompleteTask = async (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: "Completed" } : task
    );
    setTasks(updatedTasks);
    saveTasksToLocalStorage(updatedTasks);

    try {
      const taskDocRef = doc(db, "tasks", user, "userTasks", taskId);
      await setDoc(taskDocRef, { status: "Completed" }, { merge: true });
    } catch (error) {
      console.error("Error updating task: ", error);
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
                  {task.dueDate}
                </td>
                <td className="border-t border-gray-200 p-2 text-left">
                  <span className="bg-gray-300 rounded-full px-3 py-1 text-black">
                    {task.collaborator ? task.collaborator : "None"}
                  </span>
                </td>
                <td className="border-t border-gray-200 p-2 text-left">
                  <FaChevronRight
                    className="cursor-pointer bg-teal-500 p-2 text-3xl text-white mx-auto"
                    onClick={() => {
                      setSelectedTask(task);
                      setIsDrawerOpen(true);
                    }}
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
        onClick={() => setIsDrawerOpen(false)}
      />
      <div
        className={`fixed right-0 top-16 w-3/4 md:w-1/3 bg-white h-full shadow-md transition-transform transform z-10 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4">
          {selectedTask ? (
            <div>
              <h2 className="text-lg font-semibold">
                {selectedTask.taskDescription}
              </h2>
              <p>Due Date: {selectedTask.dueDate}</p>
              <p>Collaborator: {selectedTask.collaborator}</p>
              <p>Status: {selectedTask.status}</p>
              {/* Add more details as needed */}
            </div>
          ) : (
            <p>Select a task to view details.</p>
          )}
        </div>
      </div>

      {/* --------------Pagination aread----------------- */}
      <div className="flex justify-between items-center my-4 border-t border-gray-200 pt-2">
        <span>
          Page {currentPage} of {Math.ceil(tasks.length / itemsPerPage)}
        </span>
        <div>
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === Math.ceil(tasks.length / itemsPerPage)}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 ml-2"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
