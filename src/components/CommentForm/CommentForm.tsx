"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { api } from "~/utils/api";

export default function CommentForm({ commentPath }: { commentPath: string }) {
  const [content, setContent] = useState("");

  const user = useUser();
  if (!user) return <></>;

  const ctx = api.useUtils();
  const createComment = api.comment.create.useMutation({
    onSuccess: () => {
      void ctx.comment.getByPath.invalidate();
      setContent("");
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        createComment.mutate({ content, commentPath });
      }}
      className="flex flex-col gap-2"
    >
      <input
        type="text"
        placeholder="Write your comment"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      <button
        type="submit"
        className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        disabled={createComment.isLoading}
      >
        {createComment.isLoading ? "Commenting..." : "Comment"}
      </button>
    </form>
  );
}
