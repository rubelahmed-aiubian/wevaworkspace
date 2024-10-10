import { db } from "@/utils/firebase";
import { useAuth } from "@/context/AuthContext";
import React, { useState, useEffect, useRef } from 'react';
import { FaThumbsUp, FaPaperclip, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  Timestamp, 
  doc, 
  updateDoc, 
  startAfter 
} from "firebase/firestore";

interface Comment {
  id: string;
  userId: string;
  username: string;
  userPhoto: string;
  description: string;
  createdAt: Timestamp;
  isLiked: boolean;
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
  const [newComment, setNewComment] = useState('');
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
    setLoading(true);
    const commentsRef = collection(db, "tasks", userData.email, "userTasks", taskId, "comments");
    const commentsQuery = query(commentsRef, orderBy("createdAt", "desc"), limit(11));

    try {
      const snapshot = await getDocs(commentsQuery);
      const newComments = mapSnapshotToComments(snapshot.docs.slice(0, 10));
      setComments(newComments);
      setLastVisible(snapshot.docs[9]);
      setHasMore(snapshot.docs.length > 10);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const mapSnapshotToComments = (docs: any[]) => {
    return docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CommentWithAttachment));
  };

  const loadMoreComments = async () => {
    if (!lastVisible || loadingMore) return;

    setLoadingMore(true);
    const commentsRef = collection(db, "tasks", userData.email, "userTasks", taskId, "comments");
    const commentsQuery = query(commentsRef, orderBy("createdAt", "desc"), limit(11), startAfter(lastVisible));

    try {
      const snapshot = await getDocs(commentsQuery);
      const newComments = mapSnapshotToComments(snapshot.docs.slice(0, 10));
      setComments(prev => [...prev, ...newComments]);
      setLastVisible(snapshot.docs[9]);
      setHasMore(snapshot.docs.length > 10);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadFile = async (file: File): Promise<{ path: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userEmail', userData.email);

    const response = await fetch('/api/upload-file', { method: 'POST', body: formData });
    if (!response.ok) throw new Error('File upload failed');
    return response.json();
  };

  const addComment = async () => {
    if (!newComment.trim() && !file) return;

    const tempId = Date.now().toString();
    const tempComment = await createTempComment(tempId);
    setComments(prev => [tempComment, ...prev]);

    setNewComment('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

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
      userPhoto: userData.photo ? `/images/users/${userData.photo}` : "/images/users/user.png",
      description: newComment.trim(),
      createdAt: Timestamp.now(),
      isLiked: false,
      attachmentFile
    };
  };

  const saveComment = async (comment: CommentWithAttachment) => {
    const taskDocRef = doc(db, "tasks", userData.email, "userTasks", taskId);
    const commentsCollectionRef = collection(taskDocRef, "comments");

    const commentData = {
      userEmail: userData.email,
      username: userData.name,
      userPhoto: userData.photo ? `/images/users/${userData.photo}` : "/images/users/user.png",
      description: comment.description,
      createdAt: comment.createdAt,
      isLiked: false,
      ...(comment.attachmentFile && { attachmentFile: comment.attachmentFile })
    };

    return await addDoc(commentsCollectionRef, commentData);
  };

  const updateTempCommentId = (tempId: string, newId: string) => {
    setComments(prev => prev.map(c => (c.id === tempId ? { ...c, id: newId } : c)));
  };

  const removeTempComment = (tempId: string) => {
    setComments(prev => prev.filter(c => c.id !== tempId));
  };

  const toggleLike = async (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    setComments(prev =>
      prev.map(c => (c.id === commentId ? { ...c, isLiked: !c.isLiked } : c))
    );

    try {
      const commentRef = doc(db, "tasks", userData.email, "userTasks", taskId, "comments", commentId);
      await updateDoc(commentRef, { isLiked: !comment.isLiked });
    } catch (error) {
      console.error("Error toggling like:", error);
    }
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
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <div className="flex flex-col flex-grow overflow-hidden">
      <h3 className="text-sm font-bold pb-2">Comments</h3>

      <div className="flex-grow overflow-y-auto pb-4 pr-2">
        <div className="space-y-4">
          {loading
            ? Array(3).fill(0).map((_, index) => <CommentSkeleton key={index} />)
            : comments.length > 0
            ? comments.map(comment => (
                <div key={comment.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded">
                  <img src={comment.userPhoto} alt={comment.username} className="w-8 h-8 rounded-full" />
                  <div className="flex-grow">
                    <div className="flex gap-2 items-center">
                      <span className="text-sm font-semibold">{comment.username}</span>
                      <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-gray-700 text-xs">{comment.description}</p>
                    {comment.attachmentFile && (
                      <a href={`/uploads/${comment.attachmentFile.path}`} className="text-blue-500 text-xs" download>
                        <FaPaperclip className="inline" /> {comment.attachmentFile.filename}
                      </a>
                    )}
                  </div>
                  <button className="text-gray-500 hover:text-blue-500" onClick={() => toggleLike(comment.id)}>
                    <FaThumbsUp className={`${comment.isLiked ? 'text-blue-500' : 'text-gray-500'}`} />
                  </button>
                </div>
              ))
            : <p className="text-gray-500">No comments yet.</p>}
        </div>

        {hasMore && (
          <button onClick={loadMoreComments} disabled={loadingMore} className="mt-4 w-full text-blue-500">
            {loadingMore ? 'Loading...' : 'Load more comments'}
          </button>
        )}
      </div>

      <div className="pt-2 mt-2">
        <div className="flex items-start space-x-2">
          <img 
            src={userData.photo ? `/images/users/${userData.photo}` : "/images/users/user.png"} 
            alt={userData.name} 
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-grow relative">
            <textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              className="w-full p-2 pr-20 border border-gray-300 rounded-lg text-sm min-h-[60px] resize-none"
            />
            <div className="absolute bottom-2 flex items-center space-x-2 pb-2">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              <button 
                className="text-gray-500 hover:text-teal-600" 
                onClick={() => fileInputRef.current?.click()}
              >
                <FaPaperclip />
              </button>
              {file && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs truncate max-w-[100px]">{file.name}</span>
                  <FaTimes className="text-red-500 cursor-pointer" onClick={removeFile} />
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-2 pb-2">
              <button 
                className="text-gray-500 hover:text-teal-600 transition duration-200" 
                onClick={addComment}
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comments;