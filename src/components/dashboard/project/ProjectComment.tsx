//src/components/dashboard/project/ProjectComment.tsx
import { db } from "@/utils/firebase";
import { useAuth } from "@/context/AuthContext";
import React, { useState, useEffect, useRef } from "react";
import { FaTrash } from "react-icons/fa";
import { RxPaperPlane } from "react-icons/rx";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

interface Comment {
  id: string;
  createdDate: Timestamp;
  description: string;
  commentBy: string; // user email
  commentByName: string; // user name
}

interface ProjectCommentsProps {
  projectNo: string;
}

const ProjectComments: React.FC<ProjectCommentsProps> = ({ projectNo }) => {
  const { userData } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [visibleComments, setVisibleComments] = useState<Comment[]>([]);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [commentsToFetch, setCommentsToFetch] = useState(5);

  useEffect(() => {
    if (projectNo && userData) fetchComments();
  }, [projectNo, userData]);

  const fetchComments = async () => {
    setLoading(true);
    const commentsRef = collection(db, "projects", projectNo, "comments");
    const commentsQuery = query(
      commentsRef,
      orderBy("createdDate", "desc"),
      limit(commentsToFetch)
    );

    try {
      const snapshot = await getDocs(commentsQuery);
      const fetchedComments = await Promise.all(
        snapshot.docs.map(async (commentDoc) => {
          const commentData = {
            id: commentDoc.id,
            ...commentDoc.data(),
          } as Comment;

          // Fetch additional user data from members collection
          const memberDoc = await getDoc(
            doc(db, "members", commentData.commentBy)
          );
          const memberData = memberDoc.exists()
            ? memberDoc.data()
            : { name: "Unknown", photo: null };

          return {
            ...commentData,
            commentByName: memberData.name,
            commentByPhoto: memberData.photo,
          };
        })
      );
      setComments(fetchedComments);
      setVisibleComments(fetchedComments);
      setHasMoreComments(fetchedComments.length === commentsToFetch);
      console.log("comments", fetchedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !projectNo) {
      console.error("Project number is missing or comment is empty.");
      return;
    }

    const commentData = {
      createdDate: Timestamp.now(),
      description: newComment.trim(),
      commentBy: userData?.email || "Anonymous",
      commentByName: userData?.name || "Unknown",
      commentByPhoto: userData?.photo || null,
    };

    try {
      const docRef = await addDoc(
        collection(db, "projects", projectNo, "comments"),
        commentData
      );

      // Update both comments and visibleComments state
      const newCommentEntry = { id: docRef.id, ...commentData };
      setComments((prev) => [newCommentEntry, ...prev]); // Update comments state
      setVisibleComments((prev) => [newCommentEntry, ...prev]); // Update visibleComments state
      setNewComment(""); // Clear the input
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const formatTimeAgo = (timestamp: Timestamp) => {
    const now = new Date();
    const commentDate = timestamp.toDate();
    const diffInMinutes = Math.floor(
      (now.getTime() - commentDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const deleteComment = async (commentId: string) => {
    try {
      await deleteDoc(doc(db, "projects", projectNo, "comments", commentId));
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const scrollToCommentInput = () => {
    commentInputRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMoreComments = async () => {
    setCommentsToFetch((prev) => {
      const newCount = prev + 5;
      fetchComments();
      return newCount;
    });
  };

  //comment skeleton
  const CommentSkeleton = () => (
    <div className="flex items-center space-x-3 p-3 rounded animate-pulse bg-gray-50">
      <div className="w-8 h-8 bg-white rounded-full"></div>
      <div className="flex-grow">
        <div className="h-4 bg-white rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-white rounded w-3/4"></div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-bold pb-2" onClick={scrollToCommentInput}>
        Recent Updates:{" "}
        <span className="cursor-pointer underlne text-indigo-400 font-normal">
          (Leave Comments)
        </span>
      </h3>

      <div
        className="flex-grow overflow-y-auto pb-4 pr-2"
        style={{ maxHeight: "400px" }}
      >
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, index) => <CommentSkeleton key={index} />)
        ) : visibleComments.length > 0 ? (
          visibleComments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-center space-x-3 bg-white p-3 rounded mb-2"
            >
              <img
                src={
                  comment.commentByPhoto
                    ? `/images/users/${comment.commentBy}/${comment.commentByPhoto}`
                    : "/images/users/user.png"
                }
                alt={comment.commentByName || "User"}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-grow">
                <div className="flex gap-2 items-center">
                  <span className="text-xs font-semibold">
                    {comment.commentByName || "Unknown"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(comment.createdDate)}
                  </span>
                </div>
                <p className="mt-1 text-gray-700 text-sm">
                  {comment.description}
                </p>
              </div>
              <button
                onClick={() => deleteComment(comment.id)}
                className="text-gray-500 hover:text-red-600"
              >
                <FaTrash size={14} />
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No comments yet.</p>
        )}
      </div>

      {hasMoreComments && (
        <button
          onClick={loadMoreComments}
          className="text-indigo-600 hover:underline mt-2"
        >
          Previous Comments
        </button>
      )}

      <div className="pt-2 mt-2">
        <div className="flex items-start space-x-2">
          <img
            src={
              userData?.photo
                ? `/images/users/${userData?.email}/${userData?.photo}`
                : "/images/users/user.png"
            }
            alt={userData?.name || "User"}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-grow relative">
            <textarea
              ref={commentInputRef}
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm min-h-[60px] resize-none focus:outline-none"
            />
            <div className="absolute bottom-0 right-2 pb-2">
              <button
                className="text-gray-500 hover:text-indigo-600 transition duration-200"
                onClick={addComment}
              >
                <RxPaperPlane size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectComments;
