"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../Components/Navbar";
import PostCard from "../Components/PostCard";

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
  user_like_status: string | null;
  created_at: string;
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }

    fetchPosts();
  }, [router]);

  async function fetchPosts() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/feed/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch posts");

      const data = await res.json();
      setPosts(data.results || data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <div className="md:ml-64 md:pt-0 pt-0 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-8">Your Feed</h1>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No posts yet. Follow users to see their posts!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}