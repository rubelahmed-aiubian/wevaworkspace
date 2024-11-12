// src/utils/notifications.js
import { db } from "@/utils/firebase";
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";

// Function to create a notification
export const createNotification = async (title, targetId) => {
  try {
    const membersRef = collection(db, "members");
    const q = query(membersRef, where("position", "!=", "Admin"));
    const memberSnapshots = await getDocs(q);
    
    const notificationData = {
      title,
      targetId,
      isRead: false,
      createdAt: new Date(),
    };

    const promises = memberSnapshots.docs.map(async (memberDoc) => {
      const userEmail = memberDoc.data().email;
      const notificationRef = collection(db, "notifications", userEmail, "userNotifications");
      await addDoc(notificationRef, notificationData);
    });

    await Promise.all(promises);
  } catch (error) {
    console.error("Error creating notifications:", error);
  }
};

// Function to fetch notifications for a user
export const fetchNotifications = async (userEmail) => {
  try {
    const notificationsRef = collection(db, "notifications", userEmail, "userNotifications");
    const q = query(notificationsRef, where("isRead", "==", false));
    const notificationSnapshots = await getDocs(q);
    const notifications = notificationSnapshots.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

// Function to mark a notification as read
export const markNotificationAsRead = async (userEmail, notificationId) => {
  try {
    const notificationRef = doc(db, "notifications", userEmail, "userNotifications", notificationId);
    await updateDoc(notificationRef, { isRead: true });
    console.log("Notification marked as read");
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};

// Function to get unread notifications count
export const getUnreadNotificationsCount = async (userEmail) => {
  try {
    const notificationsRef = collection(db, "notifications", userEmail, "userNotifications");
    const q = query(notificationsRef, where("isRead", "==", false));
    const notificationSnapshots = await getDocs(q);
    return notificationSnapshots.size; // Count of unread notifications
  } catch (error) {
    console.error("Error getting unread notifications count:", error);
    return 0;
  }
};
