"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import Comments from "@/components/common/Comments";
import { useSidebar } from "@/components/common/SidebarContext";
import Image from "next/image";

const UserTaskView = () => {
  const { taskId } = useParams();
  const { isSidebarOpen } = useSidebar();
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) {
        console.error("Task ID is undefined");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      try {
        const taskDocRef = doc(db, "tasks", String(taskId));
        const taskDoc = await getDoc(taskDocRef);

        if (taskDoc.exists()) {
          const taskData = taskDoc.data();

          const creatorDocRef = doc(db, "members", taskData?.createdBy);
          const creatorDoc = await getDoc(creatorDocRef);
          const creatorData = creatorDoc.exists() ? creatorDoc.data() : {};

          setTask({
            ...taskData,
            createdBy: {
              email: taskData?.createdBy || "Unknown",
              name: creatorData?.name || "Unknown",
              photo: creatorData?.photo || null,
              position: creatorData?.position || "N/A",
            },
          });
        } else {
          console.log("Task not found");
        }
      } catch (error) {
        console.error("Error fetching task:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  return (
    <div
      className={`flex-auto ${
        isSidebarOpen ? "ml-64" : "ml-16"
      } mt-16 transition-all duration-300`}
    >
      <h1 className="flex items-center gap-2 text-xl font-bold mb-4">
        Task Details{" "}
        <span className="text-sm text-gray-400 font-normal">
          (task id: {taskId})
        </span>
      </h1>
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
        <button
          onClick={() => window.history.back()}
          className="bg-gray-900 text-white px-4 py-2 rounded text-md"
        >
          Go Back
        </button>
        {isLoading ? (
          <Skeleton height={20} width={100} />
        ) : (
          task.status && (
            <p
              className={`px-4 py-2 text-black rounded-md ${
                task.status === "Completed" ? "bg-green-400" : "bg-gray-400"
              }`}
            >
              {task.status}
            </p>
          )
        )}
      </div>
      <div className="flex flex-col h-full p-4">
        <div className="mt-4 space-y-2 text-sm">
          {/* Task Description */}
          {isLoading ? (
            <Skeleton height={30} width={500} />
          ) : (
            <div className="flex items-center gap-2 text-xl font-bold">
              {task.taskDescription}
              <span className="text-sm text-gray-400 font-normal">
                (Created{" "}
                {task.createdAt
                  ? new Intl.DateTimeFormat("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(task.createdAt))
                  : "N/A"}
                )
              </span>
            </div>
          )}

          {isLoading ? (
            <Skeleton height={20} width={100} />
          ) : (
            task.dueDate && (
              <p className="text-gray-600 text-md font-semibold">
                Due Date:{" "}
                <span className="text-gray-600 font-normal">
                  {new Intl.DateTimeFormat("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(task.dueDate))}
                </span>
              </p>
            )
          )}

          {/* Creator Information */}
          {isLoading ? (
            <div className="inline-flex items-center rounded-full px-2 py-1 bg-gray-200">
              <Skeleton circle={true} height={40} width={40} className="mr-2" />
              <div className="pr-2">
                <Skeleton height={20} width={80} />
                <Skeleton height={15} width={60} />
              </div>
            </div>
          ) : (
            task.createdBy && (
              <div className="mt-2">
                <p className="text-gray-600 font-semibold">Assigned By:</p>
                <div className="inline-flex items-center bg-gray-100 rounded-full p-1 mt-1">
                  <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                    <Image
                      src={
                        task.createdBy.photo
                          ? `/images/users/${task.createdBy.email}/${task.createdBy.photo}`
                          : `/images/users/user.png`
                      }
                      width={50}
                      height={50}
                      alt={task.createdBy.name || "Creator"}
                      className="w-8 h-8 rounded-full"
                    />
                  </div>
                  <div>
                    <p className="font-semibold pr-4">
                      {task.createdBy.name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {task.createdBy.position || "Position unknown"}
                    </p>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Task Summary */}
          {isLoading ? (
            <div>
              <Skeleton height={20} width={400} />
              <Skeleton height={15} width={100} />
            </div>
          ) : (
            task.summary && (
              <div className="flex flex-col pb-4">
                <span className="text-gray-600 font-bold mb-1">
                  Task Summary:
                </span>
                <p className="text-md text-justify">{task.summary}</p>
              </div>
            )
          )}
        </div>

        {/* Comment Section */}
        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
          <Comments taskId={String(taskId)} />
        </div>
      </div>
    </div>
  );
};

export default UserTaskView;
