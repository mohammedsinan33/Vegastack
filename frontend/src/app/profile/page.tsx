"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../Components/Navbar";
import { Edit3, Plus } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  bio: string;
  website: string;
  location: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
}

interface Post {
  id: string;
  image_url: string;
  content: string;
  like_count: number;
  comment_count: number;
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }

    fetchUserProfile();
    fetchUserPosts();
  }, [router]);

  async function fetchUserProfile() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/profile/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Profile response status:", res.status); // Debug
      const data = await res.json();
      console.log("Profile response:", data); // Debug

      if (!res.ok) throw new Error(data.detail || data.error || "Failed to fetch profile");

      setUser(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }

  async function fetchUserPosts() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/?author_id=me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Posts response status:", res.status); // Debug
      const data = await res.json();
      console.log("Posts response:", data); // Debug

      if (!res.ok) throw new Error(data.detail || data.error || "Failed to fetch posts");

      setPosts(data.results || data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="md:ml-64 pt-20 pb-20 md:pb-0">
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="md:ml-64 pt-0 pb-20 md:pb-0">
        {/* Profile Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              {/* Avatar */}
              <div className="w-full md:w-auto">
                <img
                  src={
                    user.avatar_url ||
                    "https://via.placeholder.com/150?text=Avatar"
                  }
                  alt={user.first_name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-gray-200"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 w-full">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {user.first_name} {user.last_name}
                    </h1>
                    <p className="text-gray-600">@{user.email.split("@")[0]}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                      <Edit3 size={18} />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setShowNewPostModal(true)}
                      className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
                    >
                      <Plus size={18} />
                      New Post
                    </button>
                  </div>
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="text-gray-800 mb-4 text-lg">{user.bio}</p>
                )}

                {/* Additional Info */}
                <div className="flex gap-4 text-gray-600 mb-4">
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <span>📍</span>
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.website && (
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      🔗 {user.website}
                    </a>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{posts.length}</p>
                    <p className="text-gray-600">posts</p>
                  </div>
                  <div className="text-center cursor-pointer hover:opacity-80">
                    <p className="text-2xl font-bold">
                      {user.followers_count || 0}
                    </p>
                    <p className="text-gray-600">followers</p>
                  </div>
                  <div className="text-center cursor-pointer hover:opacity-80">
                    <p className="text-2xl font-bold">
                      {user.following_count || 0}
                    </p>
                    <p className="text-gray-600">following</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 sticky top-0 md:relative">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex justify-center gap-8 md:gap-16">
              <button className="py-4 px-4 md:px-0 border-b-2 border-black font-semibold">
                Posts
              </button>
              <button className="py-4 px-4 md:px-0 border-b-2 border-transparent text-gray-600 hover:text-black font-semibold">
                Saved
              </button>
              <button className="py-4 px-4 md:px-0 border-b-2 border-transparent text-gray-600 hover:text-black font-semibold">
                Tagged
              </button>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-xl font-semibold mb-2">No posts yet</p>
              <p className="text-gray-600">
                Share your first photo to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="aspect-square overflow-hidden rounded-lg cursor-pointer group relative"
                >
                  <img
                    src={post.image_url || "https://via.placeholder.com/300"}
                    alt="Post"
                    className="w-full h-full object-cover group-hover:opacity-75 transition"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100">
                    <div className="text-white text-center">
                      <p className="text-2xl font-bold">❤️ {post.like_count}</p>
                    </div>
                    <div className="text-white text-center">
                      <p className="text-2xl font-bold">💬 {post.comment_count}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedUser) => {
            setUser(updatedUser);
            setShowEditModal(false);
          }}
        />
      )}

      {/* New Post Modal */}
      {showNewPostModal && (
        <NewPostModal
          onClose={() => setShowNewPostModal(false)}
          onPostCreated={(newPost) => {
            setPosts([newPost, ...posts]);
            setShowNewPostModal(false);
          }}
        />
      )}
    </div>
  );
}

// Edit Profile Modal Component
function EditProfileModal({
  user,
  onClose,
  onSave,
}: {
  user: UserProfile;
  onClose: () => void;
  onSave: (user: UserProfile) => void;
}) {
  const [form, setForm] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    bio: user.bio || "",
    website: user.website || "",
    location: user.location || "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar_url || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      let avatar_url = user.avatar_url;

      // Upload avatar if changed
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile); // Change "file" to "avatar"

        const uploadRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/upload-avatar/`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.detail || errorData.error || "Failed to upload avatar");
        }

        const uploadData = await uploadRes.json();
        avatar_url = uploadData.avatar_url;
      }

      // Update profile
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/complete-profile/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...form, avatar_url }),
        }
      );

      if (!res.ok) throw new Error("Failed to update profile");

      const data = await res.json();
      onSave({ ...user, ...data });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Avatar Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3">Avatar</label>
            <div className="flex items-center gap-4">
              <img
                src={
                  avatarPreview ||
                  "https://via.placeholder.com/100?text=Avatar"
                }
                alt="Avatar preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
              <label className="flex-1 px-4 py-2 bg-blue-50 border-2 border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 cursor-pointer font-semibold text-sm text-center transition">
                Choose Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">
              First Name
            </label>
            <input
              type="text"
              value={form.first_name}
              onChange={(e) =>
                setForm({ ...form, first_name: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              maxLength={160}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {form.bio.length}/160
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Website</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// New Post Modal Component
function NewPostModal({
  onClose,
  onPostCreated,
}: {
  onClose: () => void;
  onPostCreated: (post: Post) => void;
}) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const charCount = content.length;
  const charLimit = 280;

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("Post content cannot be empty");
      return;
    }

    if (content.length > charLimit) {
      setError(`Post is too long (${charCount}/${charLimit})`);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      let image_url = null;

      // Upload image if provided
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile); // Changed field name to "image"

        const uploadRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/upload-image/`, // New endpoint
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.detail || errorData.error || "Failed to upload image");
        }

        const uploadData = await uploadRes.json();
        image_url = uploadData.image_url;
      }

      // Create post
      const postRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: content.trim(),
            image_url,
          }),
        }
      );

      if (!postRes.ok) {
        const errorData = await postRes.json();
        throw new Error(
          errorData.detail || errorData.content?.[0] || "Failed to create post"
        );
      }

      const newPost = await postRes.json();
      onPostCreated(newPost);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Post creation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Create Post</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Image Section */}
          {imagePreview && (
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">Image</label>
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Post preview"
                  className="w-full max-h-64 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview("");
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {!imagePreview && (
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">
                Add Image (Optional)
              </label>
              <label className="w-full px-4 py-8 bg-gray-50 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer font-semibold text-center transition">
                📸 Click to upload image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Content Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">
              What's on your mind?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={charLimit}
              rows={4}
              placeholder="Share your thoughts... (max 280 characters)"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <p className={`text-sm font-semibold ${charCount === charLimit ? "text-red-600" : "text-gray-600"}`}>
                {charCount}/{charLimit}
              </p>
              {charCount === charLimit && (
                <p className="text-xs text-red-600">Character limit reached</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}