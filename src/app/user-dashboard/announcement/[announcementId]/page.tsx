"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { db } from "@/utils/firebase";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { useSidebar } from "@/components/common/SidebarContext";
import Skeleton from "react-loading-skeleton"; // Importing Skeleton

export default function AnnouncementDetail({
  params,
}: {
  params: { announcementId: string };
}) {
  const { user } = useAuth();
  const router = useRouter();
  const { isSidebarOpen } = useSidebar();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  const { announcementId } = params;

  useEffect(() => {
    const fetchAnnouncement = async () => {
      const docRef = doc(db, "announcement", announcementId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setAnnouncement({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log("No such document!");
      }
      setLoading(false);
    };

    fetchAnnouncement();
  }, [announcementId]);

  return (
    <div
      className={`flex-auto ${
        isSidebarOpen ? "ml-64" : "ml-16"
      } mt-16 transition-all duration-300`}
    >
      <h1 className="flex items-center gap-2 text-xl font-bold mb-4">
        Announcement Details{" "}
        <span className="text-sm text-gray-400 font-normal">
          (announcement id: {announcementId})
        </span>
      </h1>
      <div className="">
        <div className="rounded-lg bg-white border border-gray-200">
          {loading ? (
            // Header Skeleton
            <div className="bg-gray-100 p-4 flex justify-between items-center rounded-t-lg">
              <Skeleton height={30} width={`300px`} className="mb-2" />
              <Skeleton height={20} width={`150px`} className="mb-2" />
            </div>
          ) : (
            <div className="bg-gray-100 p-4 flex justify-between items-center rounded-t-lg">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                {announcement.title}
                <span className="text-sm text-gray-400 font-normal">
                  (
                  {announcement.publishDate
                    .toDate()
                    .toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  )
                </span>
              </h2>
              <span className="text-sm text-gray-600">
                Published by: {announcement.publishedBy}
              </span>
            </div>
          )}
          {loading ? (
            // Body Skeleton
            <div className="p-4 min-h-[200px]">
              <Skeleton height={20} width={`80%`} className="mb-2" />
              <Skeleton height={20} width={`60%`} className="mb-4" />
            </div>
          ) : (
            <div className="p-4 min-h-[200px]">
              <p className="text-gray-800">{announcement.message}</p>
            </div>
          )}
        </div>
        <div className="p-4 text-center">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-900"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
