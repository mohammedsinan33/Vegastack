"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    first_name: string;
    avatar_url: string;
  };
  created_at: string;
}

interface CommentSectionProps {
  postId: string;
  initialComments?: Comment[];
  onClose: () => void;
}

export default function CommentSection({
  postId,
  initialComments = [],
  onClose,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [loading, setLoading] = useState(!initialComments.length);

  useEffect(() => {
    if (initialComments.length === 0) {
      fetchComments();
    }
  }, [postId, initialComments.length]);

  async function fetchComments() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${postId}/comments/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setComments(data.results || data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleCommentAdded = (newComment: Comment) => {
    setComments([newComment, ...comments]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Comments</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No comments yet. Be the first!</p>
            </div>
          ) : (
            <div>
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>

        {/* Comment Form */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <CommentForm
            postId={postId}
            onCommentAdded={handleCommentAdded}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}