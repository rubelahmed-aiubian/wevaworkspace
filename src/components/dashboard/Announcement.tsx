import { useRouter, usePathname, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { db } from "@/utils/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { IoTrashOutline } from "react-icons/io5";
import { RxPaperPlane } from "react-icons/rx";
import Skeleton from "react-loading-skeleton";
import { v4 as uuidv4 } from "uuid";
import { createNotification } from "@/utils/notifications";

export default function Announcement() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const deleteSpin = `animate-spin rounded-full h-5 w-5 border-b-2 border-red-400 mr-2`;
  const loadingSpin = `animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2`;
  const [fetchLoading, setFetchLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  const publishAnnouncement = async () => {
    if (!user) return;
    if (userData.position !== "Admin") {
      alert("Only admins can publish announcements.");
      return;
    }
    if (title && message) {
      setIsPublishing(true);
      const announcementId = uuidv4().slice(0, 8);
      await setDoc(doc(db, "announcement", announcementId), {
        title,
        message,
        publishDate: new Date(),
        publishedBy: userData.name || "Unknown",
      });

      await createNotification(title, announcementId);

      setTitle("");
      setMessage("");
      fetchAnnouncements();
      setIsPublishing(false);
    }
  };

  const fetchAnnouncements = async () => {
    setFetchLoading(true);
    const q = query(
      collection(db, "announcement"),
      orderBy("publishDate", "desc")
    );
    const announcementSnapshots = await getDocs(q);
    setAnnouncements(
      announcementSnapshots.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
    setFetchLoading(false);
  };

  const deleteAnnouncement = async (id) => {
    setLoadingId(id);
    await deleteDoc(doc(db, "announcement", id));
    fetchAnnouncements();
    setShowModal(false);
    setLoadingId(null);
  };

  const isNextPageAvailable =
    currentPage < Math.ceil(announcements.length / itemsPerPage);
  const isPreviousPageAvailable = currentPage > 1;

  const handleNextPage = () => {
    if (isNextPageAvailable) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      router.push(`${pathname}?page=${nextPage}`, undefined, { shallow: true });
    }
  };

  const handlePreviousPage = () => {
    if (isPreviousPageAvailable) {
      const previousPage = currentPage - 1;
      setCurrentPage(previousPage);
      router.push(`${pathname}?page=${previousPage}`, undefined, {
        shallow: true,
      });
    }
  };

  const paginatedAnnouncements = announcements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    fetchAnnouncements();
  }, [user]);

  return (
    <div className="flex gap-6">
      {/* First Column - Add Announcement */}
      <div className="w-1/2">
        <div className="">
          <input
            type="text"
            placeholder="Announcement Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 mb-4 border focus:outline-none rounded"
          />
          <textarea
            placeholder="Write message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 mb-4 border focus:outline-none rounded resize-none"
            rows={10}
          />
          <button
            onClick={publishAnnouncement}
            className="px-4 py-2 text-white bg-gray-800 hover:bg-gray-900 rounded"
            disabled={!user || isPublishing}
          >
            <span className="flex items-center">
              {isPublishing ? (
                <>
                  <div className={`${loadingSpin} mx-auto`} />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  Publish
                  <RxPaperPlane className="ml-2" />
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Second Column - Display Announcements */}
      <div className="w-1/2">
        <div className="flex flex-col">
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle pb-4">
              <div className="overflow-hidden border rounded-lg shadow">
                <table className="min-w-full rounded-xl">
                  <thead>
                    <tr className="bg-gray-50">
                      <th
                        scope="col"
                        className="p-5 text-left text-md leading-6 font-semibold text-gray-900 capitalize"
                        style={{ width: "85%" }}
                      >
                        Announcements
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
                  <tbody className="divide-y divide-gray-100">
                    {fetchLoading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <tr
                          key={index}
                          className="odd:bg-white even:bg-gray-50"
                        >
                          <td className="pl-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                            <Skeleton height={20} width={120} />
                            <Skeleton height={10} width={60} />
                          </td>
                          <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900 text-center">
                            <Skeleton height={20} width={50} />
                          </td>
                        </tr>
                      ))
                    ) : paginatedAnnouncements.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center p-4">
                          No announcements available!
                        </td>
                      </tr>
                    ) : (
                      paginatedAnnouncements.map((announcement) => (
                        <tr
                          key={announcement.id}
                          className="odd:bg-white even:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setSelectedAnnouncement(announcement);
                            setShowModal(true);
                            router.push(
                              `${pathname}?id=${announcement.id}`,
                              undefined,
                              { shallow: true }
                            );
                          }}
                        >
                          <td className="pl-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                            {announcement.title}
                          </td>
                          <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900 text-center">
                            {loadingId === announcement.id ? (
                              <div className={deleteSpin} />
                            ) : (
                              <IoTrashOutline
                                className="text-red-600 cursor-pointer"
                                onClick={async (e) => {
                                  e.stopPropagation(); // Prevent row click
                                  setLoadingId(announcement.id); // Set loading ID for spinner
                                  await deleteAnnouncement(announcement.id); // Delete the announcement
                                  // No need to close the modal here
                                }}
                              />
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Pagination Controls */}
            <div className="flex flex-col items-center">
              {/* Help text */}
              <span className="text-sm text-gray-700 dark:text-gray-400">
                Showing{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {Math.min(currentPage * itemsPerPage, announcements.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {announcements.length}
                </span>{" "}
                Entries
              </span>
              {/* Buttons */}
              {Math.ceil(announcements.length / itemsPerPage) > 1 && ( // Check if more than one page exists
                <div className="inline-flex mt-2 xs:mt-0">
                  <button
                    onClick={handlePreviousPage}
                    disabled={!isPreviousPageAvailable}
                    className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    Prev
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={!isNextPageAvailable}
                    className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 border-0 border-s border-gray-700 rounded-e hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Viewing Announcement Details */}
      {showModal && selectedAnnouncement && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
          <div className="bg-white rounded-2xl p-6 shadow-lg z-50 sm:max-w-lg sm:w-full m-5">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h4 className="text-md text-gray-900 font-semibold">
                {selectedAnnouncement.title}
              </h4>
              <div className="text-xs text-gray-800">
                Published at{" "}
                {new Date(
                  selectedAnnouncement.publishDate.seconds * 1000
                ).toLocaleDateString()}
              </div>
            </div>
            <div className="overflow-y-auto pt-4 min-h-[100px]">
              <p className="text-gray-600 text-sm text-justify">
                {selectedAnnouncement.message}
              </p>
            </div>
            <div className="flex items-center justify-end pt-4 space-x-4">
              <button
                className="flex items-center justify-center py-2.5 w-20 px-5 text-xs bg-red-600 text-white rounded cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 hover:bg-red-700"
                onClick={async () => {
                  await deleteAnnouncement(selectedAnnouncement.id);
                  // Remove the announcement ID from the URL after deletion
                  router.push(`${pathname}?page=${currentPage}`, undefined, {
                    shallow: true,
                  });
                }}
              >
                {loadingId === selectedAnnouncement.id ? (
                  <div className={`${loadingSpin} mx-auto`} />
                ) : (
                  "Delete"
                )}
              </button>
              <button
                className="py-2.5 px-5 text-xs bg-gray-300 text-gray-700 rounded cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 hover:bg-gray-400"
                onClick={() => {
                  setShowModal(false);
                  router.push(`${pathname}?page=${currentPage}`, undefined, {
                    shallow: true,
                  });
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
