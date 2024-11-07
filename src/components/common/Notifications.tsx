import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/utils/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  doc,
  collection,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { FaBell } from "react-icons/fa";
import { FiXCircle } from "react-icons/fi";
import Skeleton from "react-loading-skeleton";

const Notifications = () => {
  const { userData } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const itemsPerPage = 10;
  const router = useRouter();

  useEffect(() => {
    if (userData?.email) {
      fetchNotifications();
    }
  }, [userData]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const userNotificationsRef = collection(
        db,
        "notifications",
        userData.email,
        "userNotifications"
      );
      const notificationsQuery = query(
        userNotificationsRef,
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(notificationsQuery);

      const notificationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(notificationsData);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    setDeletingId(notificationId);
    try {
      await deleteDoc(
        doc(
          db,
          "notifications",
          userData.email,
          "userNotifications",
          notificationId
        )
      );
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      const notificationRef = doc(
        db,
        "notifications",
        userData.email,
        "userNotifications",
        notification.id
      );
      await updateDoc(notificationRef, { isRead: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
    }
    router.push(`/user-dashboard/announcement/${notification.targetId}`);
  };

  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    if (currentPage * itemsPerPage < notifications.length) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="notifications-container border p-4 rounded-lg">
      <table className="w-full">
        <tbody>
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="flex items-center py-2">
                  <Skeleton circle height={24} width={24} className="mr-2" />
                  <div className="flex-1">
                    <Skeleton height={20} width="70%" />
                  </div>
                </td>
              </tr>
            ))
          ) : notifications.length === 0 ? (
            <tr>
              <td colSpan={2} className="text-center py-4">
                No notifications available!
              </td>
            </tr>
          ) : (
            paginatedNotifications.map((notification) => (
              <tr
                key={notification.id}
                className="cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <td className="flex items-center py-2">
                  <FaBell className="mr-2 text-gray-500" />
                  <div className="flex items-center">
                    <span
                      className={`mr-2 ${
                        notification.isRead ? "font-normal" : "font-bold"
                      }`}
                    >
                      {notification.title}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(notification.createdAt.toDate(), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </td>
                <td className="text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    {deletingId === notification.id ? (
                      <div className="w-4 h-4 border-2 border-t-transparent border-red-400 rounded-full animate-spin"></div>
                    ) : (
                      <FiXCircle />
                    )}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex flex-col items-center mt-4">
        <span className="text-sm text-gray-700 dark:text-gray-400">
          Showing{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {(currentPage - 1) * itemsPerPage + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {Math.min(currentPage * itemsPerPage, notifications.length)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {notifications.length}
          </span>{" "}
          Entries
        </span>

        {Math.ceil(notifications.length / itemsPerPage) > 1 && (
          <div className="inline-flex mt-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900"
            >
              Prev
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage * itemsPerPage >= notifications.length}
              className="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-gray-800 border-0 border-s border-gray-700 rounded-e hover:bg-gray-900"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
