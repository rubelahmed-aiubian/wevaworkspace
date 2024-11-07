import { db } from "@/utils/firebase";
import { useAuth } from "@/context/AuthContext";
import React, { useState, useEffect, useRef } from "react";
import { FaPaperclip, FaTimes } from "react-icons/fa";
import { RxPaperPlane } from "react-icons/rx";
import {
  doc,
  getDoc,
  addDoc,
  getDocs,
  collection,
  query,
  orderBy,
  limit,
  Timestamp,
  updateDoc,
  startAfter,
} from "firebase/firestore";

interface Comment {
  id: string;
  userId: string;
  username: string;
  userPhoto: string;
  description: string;
  createdAt: Timestamp;
}

interface CommentWithAttachment extends Comment {
  attachmentFile?: {
    path: string;
    filename: string;
  };
}

interface CommentsProps {
  taskId: string;
}

const Comments: React.FC<CommentsProps> = ({ taskId }) => {
  const { userData } = useAuth();
  const [comments, setComments] = useState<CommentWithAttachment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (taskId && userData) fetchComments();
  }, [taskId, userData]);

  const fetchComments = async () => {
    if (!taskId || !userData) {
      console.error("Task ID or user data is not available");
      return; // Early return if taskId or userData is not valid
    }

    setLoading(true);
    const commentsRef = collection(db, "tasks", taskId, "comments");
    const commentsQuery = query(
      commentsRef,
      orderBy("createdAt", "desc"),
      limit(4)
    );

    try {
      const snapshot = await getDocs(commentsQuery);
      const newComments = await mapSnapshotToComments(
        snapshot.docs.slice(0, 4)
      );
      console.log("Fetched comments:", newComments); // Log fetched comments
      setComments(newComments);
      setLastVisible(snapshot.docs[3]);
      setHasMore(snapshot.docs.length > 4);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const mapSnapshotToComments = async (docs: any[]) => {
    const comments = await Promise.all(
      docs
        .filter(
          (snapshotDoc) => snapshotDoc && snapshotDoc.id && snapshotDoc.data()
        )
        .map(async (snapshotDoc) => {
          const data = snapshotDoc.data();
          const memberRef = doc(db, "members", data.commentBy);
          const memberDoc = await getDoc(memberRef);
          const memberData = memberDoc.exists() ? memberDoc.data() : null;

          return {
            id: snapshotDoc.id,
            userId: data.commentBy,
            username: memberData?.name || "Unknown",
            userPhoto: memberData?.photo
              ? `/images/users/${data.commentBy}/${memberData.photo}`
              : "/images/users/user.png",
            description: data.description,
            createdAt: data.createdAt,
            attachmentFile: data.attachmentFile,
          } as CommentWithAttachment;
        })
    );

    return comments;
  };

  const loadMoreComments = async () => {
    if (!lastVisible || loadingMore) return;

    setLoadingMore(true);
    const commentsRef = collection(db, "tasks", taskId, "comments");
    const commentsQuery = query(
      commentsRef,
      orderBy("createdAt", "desc"),
      limit(4),
      startAfter(lastVisible)
    );

    try {
      const snapshot = await getDocs(commentsQuery);
      const newComments = mapSnapshotToComments(snapshot.docs.slice(0, 4));
      setComments((prev) => [...prev, ...newComments]);
      setLastVisible(snapshot.docs[3]);
      setHasMore(snapshot.docs.length > 4);
    } catch (error) {
      console.error("Error loading more comments:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files ? e.target.files[0] : null);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadFile = async (
    file: File
  ): Promise<{ path: string; filename: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("taskId", taskId); // Pass the taskId here
    formData.append("userEmail", userData.email); // Pass the user email

    const response = await fetch("/api/upload-taskfile", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("File upload failed");
    return response.json();
  };

  const addComment = async () => {
    if (!newComment.trim() && !file) return;

    const tempId = Date.now().toString();
    const tempComment = await createTempComment(tempId);
    setComments((prev) => {
      const previousComments = Array.isArray(prev) ? prev : [];
      return [tempComment, ...previousComments];
    });

    setNewComment("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      const docRef = await saveComment(tempComment);
      updateTempCommentId(tempId, docRef.id);
    } catch (error) {
      console.error("Error adding comment:", error);
      removeTempComment(tempId);
    }
  };

  const createTempComment = async (tempId: string) => {
    let attachmentFile;
    if (file) {
      try {
        attachmentFile = await uploadFile(file);
      } catch (error) {
        console.error("Error uploading file:", error);
        return;
      }
    }

    return {
      id: tempId,
      userId: userData.email,
      username: userData.name,
      userPhoto: userData.photo
        ? `/images/users/${userData.email}/${userData.photo}`
        : "/images/users/user.png",
      description: newComment.trim(),
      createdAt: Timestamp.now(),
      attachmentFile,
    };
  };

  const saveComment = async (comment: CommentWithAttachment) => {
    if (!userData?.email || !taskId) {
      console.error("User email or task ID is undefined");
      return; // Early return if userData or taskId is not valid
    }

    const taskDocRef = doc(db, "tasks", taskId);
    const commentsCollectionRef = collection(taskDocRef, "comments");

    const commentData = {
      commentBy: userData.email,
      description: comment.description,
      createdAt: comment.createdAt,
      ...(comment.attachmentFile && { attachmentFile: comment.attachmentFile }),
    };

    return await addDoc(commentsCollectionRef, commentData);
  };

  const updateTempCommentId = (tempId: string, newId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === tempId ? { ...c, id: newId } : c))
    );
  };

  const removeTempComment = (tempId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== tempId));
  };

  const CommentSkeleton = () => (
    <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded animate-pulse">
      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
      <div className="flex-grow">
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-3/4"></div>
      </div>
    </div>
  );

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

  return (
    <div className="flex flex-col flex-grow overflow-hidden bg-gray-50 p-2">
      <h3 className="text-sm font-bold pb-2">Comments</h3>

      <div
        className="flex-grow overflow-y-auto pb-4 pr-2"
        style={{ maxHeight: "400px" }}
      >
        <div className="space-y-4">
          {loading ? (
            Array(3)
              .fill(0)
              .map((_, index) => <CommentSkeleton key={index} />)
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="flex items-center space-x-3 bg-white p-3 rounded-lg"
              >
                <img
                  src={comment.userPhoto}
                  alt={comment.username}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-grow">
                  <div className="flex gap-2 items-center">
                    <span className="text-sm font-semibold">
                      {comment.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-700 text-xs">
                    {comment.description}
                  </p>
                  {comment.attachmentFile && (
                    <a
                      href={`${comment.attachmentFile.path}`}
                      className="text-blue-500 text-xs"
                      download
                    >
                      <FaPaperclip className="inline" />{" "}
                      {comment.attachmentFile.fileName}
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No comments yet.</p>
          )}
        </div>

        {hasMore && (
          <button
            onClick={loadMoreComments}
            disabled={loadingMore}
            className="mt-4 w-full text-blue-500"
          >
            {loadingMore ? "Loading..." : "Load more comments"}
          </button>
        )}
      </div>

      <div className="pt-2 mt-2">
        <div className="flex items-start space-x-2">
          <img
            src={
              userData.photo
                ? `/images/users/${userData.email}/${userData.photo}`
                : "/images/users/user.png"
            }
            alt={userData.name}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-grow relative">
            <textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-2 pr-20 border border-gray-300 rounded-lg text-sm min-h-[60px] resize-none focus:outline-none"
            />
            <div className="absolute bottom-2 flex items-center space-x-2 pb-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                className="text-gray-500 hover:text-teal-600"
                onClick={() => fileInputRef.current?.click()}
              >
                <FaPaperclip />
              </button>
              {file && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs truncate max-w-[100px]">
                    {file.name}
                  </span>
                  <FaTimes
                    className="text-red-500 cursor-pointer"
                    onClick={removeFile}
                  />
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-2 pb-2">
              <button
                className="text-gray-500 hover:text-teal-600 transition duration-200"
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

export default Comments;
