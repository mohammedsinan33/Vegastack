interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    user: {
      id: string;
      first_name: string;
      avatar_url: string;
    };
    created_at: string;
  };
}

export default function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="flex gap-3 py-4 border-b border-gray-200">
      {/* Avatar */}
      <img
        src={comment.user.avatar_url || "https://via.placeholder.com/40"}
        alt={comment.user.first_name}
        className="w-10 h-10 rounded-full object-cover"
      />

      {/* Comment Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-sm">{comment.user.first_name}</p>
          <p className="text-xs text-gray-500">
            {new Date(comment.created_at).toLocaleDateString()}
          </p>
        </div>
        <p className="text-gray-800 text-sm">{comment.content}</p>
      </div>
    </div>
  );
}