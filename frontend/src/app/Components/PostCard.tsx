"use client";

import { useState } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import CommentSection from "./CommentSection";

interface Post {
  id: string;
  author: {
    id: string;
    email: string;
    first_name: string;
    avatar_url: string;
  };
  content: string;
  image_url: string;
  like_count: number;
  dislike_count: number;
  comment_count: number;
  comments?: any[];
  user_like_status: string | null;
  created_at: string;
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [likeStatus, setLikeStatus] = useState(post.user_like_status);
  const [likes, setLikes] = useState(post.like_count);
  const [dislikes, setDislikes] = useState(post.dislike_count);

  async function handleLike(isLike: boolean) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${post.id}/like/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ is_liked: isLike }),
        }
      );

      if (res.ok) {
        if (likeStatus === (isLike ? "like" : "dislike")) {
          // Remove like/dislike
          setLikeStatus(null);
          if (isLike) setLikes(likes - 1);
          else setDislikes(dislikes - 1);
        } else if (likeStatus) {
          // Change from like to dislike or vice versa
          if (isLike) {
            setLikes(likes + 1);
            setDislikes(dislikes - 1);
          } else {
            setLikes(likes - 1);
            setDislikes(dislikes + 1);
          }
          setLikeStatus(isLike ? "like" : "dislike");
        } else {
          // New like/dislike
          if (isLike) setLikes(likes + 1);
          else setDislikes(dislikes + 1);
          setLikeStatus(isLike ? "like" : "dislike");
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Post Header */}
        <div className="p-4 flex items-center gap-3">
          <img
            src={post.author.avatar_url || "https://via.placeholder.com/40"}
            alt={post.author.first_name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold">{post.author.first_name}</p>
            <p className="text-sm text-gray-500">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Post Content */}
        <p className="px-4 py-2 text-gray-800">{post.content}</p>

        {/* Post Image */}
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post"
            className="w-full max-h-96 object-cover"
          />
        )}

        {/* Post Stats */}
        <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-100">
          <span>{likes + dislikes} interactions</span> •{" "}
          <span>{post.comment_count} comments</span>
        </div>

        {/* Post Actions */}
        <div className="p-4 flex justify-around text-gray-600">
          <button
            onClick={() => handleLike(true)}
            className={`flex items-center gap-2 hover:text-red-600 transition ${
              likeStatus === "like" ? "text-red-600" : ""
            }`}
          >
            <Heart
              size={20}
              fill={likeStatus === "like" ? "currentColor" : "none"}
            />
            <span>Like ({likes})</span>
          </button>

          <button
            onClick={() => handleLike(false)}
            className={`flex items-center gap-2 hover:text-blue-600 transition ${
              likeStatus === "dislike" ? "text-blue-600" : ""
            }`}
          >
            <Heart
              size={20}
              fill={likeStatus === "dislike" ? "currentColor" : "none"}
              className="rotate-180"
            />
            <span>Dislike ({dislikes})</span>
          </button>

          <button
            onClick={() => setShowComments(true)}
            className="flex items-center gap-2 hover:text-blue-600 transition"
          >
            <MessageCircle size={20} />
            <span>Comment ({post.comment_count})</span>
          </button>

          <button className="flex items-center gap-2 hover:text-green-600 transition">
            <Share2 size={20} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section Modal */}
      {showComments && (
        <CommentSection
          postId={post.id}
          initialComments={post.comments || []}
          onClose={() => setShowComments(false)}
        />
      )}
    </>
  );
}