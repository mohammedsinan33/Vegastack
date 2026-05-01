"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProfileInputProps {
  token: string;
  onComplete: (data: any) => void;
}

export default function ProfileInput({ token, onComplete }: ProfileInputProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    avatar_url: "",
    website: "",
    location: "",
    interests: "",
  });

  async function handleAvatarUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/upload-avatar/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setForm({ ...form, avatar_url: data.avatar_url });
    } catch (err) {
      setError("Avatar upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/complete-profile/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          interests: form.interests.split(",").map((i) => i.trim()).filter(i => i),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data?.detail || "Failed to update profile");
        return;
      }

      localStorage.setItem("user", JSON.stringify(form));
      router.push("/feed");
      onComplete(form);
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="First Name"
            className="w-full p-2 border mb-4 rounded"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Last Name"
            className="w-full p-2 border mb-4 rounded"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          />
          <textarea
            placeholder="Bio (max 160 chars)"
            maxLength={160}
            className="w-full p-2 border mb-4 rounded"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Upload Avatar</label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              className="w-full p-2 border rounded"
              onChange={(e) => {
                if (e.target.files?.[0]) handleAvatarUpload(e.target.files[0]);
              }}
              disabled={uploading}
            />
            {form.avatar_url && <p className="text-green-500 text-sm mt-2">✓ Avatar uploaded</p>}
          </div>

          <input
            type="url"
            placeholder="Website"
            className="w-full p-2 border mb-4 rounded"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
          <input
            type="text"
            placeholder="Location"
            className="w-full p-2 border mb-4 rounded"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <input
            type="text"
            placeholder="Interests (comma separated)"
            className="w-full p-2 border mb-4 rounded"
            value={form.interests}
            onChange={(e) => setForm({ ...form, interests: e.target.value })}
          />

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Saving..." : uploading ? "Uploading..." : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}