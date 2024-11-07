import { useRouter, usePathname, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { db } from "@/utils/firebase";
import { useAuth } from "@/context/AuthContext";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Skeleton from "react-loading-skeleton";

export default function Announcement() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [announcements, setAnnouncements] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

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
      <div className="w-full overflow-x-auto">
        <table className="min-w-full border rounded-lg shadow">
          <thead className="bg-gray-50">
            <tr>
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
                Published Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {fetchLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index} className="odd:bg-white even:bg-gray-50">
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
                <td colSpan={2} className="text-center p-4">
                  No announcements available!
                </td>
              </tr>
            ) : (
              paginatedAnnouncements.map((announcement) => (
                <tr
                  key={announcement.id}
                  className="odd:bg-white even:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    router.push(
                      `/user-dashboard/announcement/${announcement.id}`
                    );
                  }}
                >
                  <td className="pl-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    {announcement.title}
                  </td>
                  <td className="p-5 whitespace-nowrap text-sm leading-6 font-medium text-gray-900 text-center">
                    {announcement.publishDate
                      .toDate()
                      .toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
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
              {Math.min(currentPage * itemsPerPage, announcements.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {announcements.length}
            </span>{" "}
            Entries
          </span>

          {/* Pagination Buttons */}
          {Math.ceil(announcements.length / itemsPerPage) > 1 && (
            <div className="inline-flex mt-2">
              <button
                onClick={handlePreviousPage}
                disabled={!isPreviousPageAvailable}
                className="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900"
              >
                Prev
              </button>
              <button
                onClick={handleNextPage}
                disabled={!isNextPageAvailable}
                className="flex items-center justify-center px-4 h-10 text-base font-medium text-white bg-gray-800 border-0 border-s border-gray-700 rounded-e hover:bg-gray-900"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
