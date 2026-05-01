import { useState } from "react";

interface CommentFormProps {
  postId: string;
  onCommentAdded: (comment: any) => void;
  loading?: boolean;
}

export default function CommentForm({
  postId,
  onCommentAdded,
  loading = false,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${postId}/comments/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: content.trim() }),
        }
      );

      console.log("Comment response status:", res.status); // Debug
      const data = await res.json();
      console.log("Comment response:", data); // Debug full error

      if (!res.ok) {
        throw new Error(data.detail || JSON.stringify(data) || "Failed to add comment");
      }

      onCommentAdded(data);
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding comment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="py-4 border-b border-gray-200">
      {error && (
        <p className="text-red-600 text-sm mb-2">{error}</p>
      )}

      <div className="flex gap-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          maxLength={500}
          rows={2}
          disabled={submitting || loading}
          className="flex-1 p-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
        />

        <button
          type="submit"
          disabled={submitting || loading || !content.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-fit"
        >
          {submitting ? "..." : "Post"}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-1">
        {content.length}/500
      </p>
    </form>
  );
}