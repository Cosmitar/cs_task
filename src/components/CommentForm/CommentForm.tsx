"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useState } from "react";
import { api } from "~/utils/api";

export default function CommentForm({ commentPath }: { commentPath: string }) {
  const [content, setContent] = useState("");

  const ctx = api.useUtils();
  const createComment = api.comment.create.useMutation({
    onSuccess: () => {
      void ctx.comment.getByPath.invalidate();
      setContent("");
    },
  });

  const auth = useUser();
  if (!auth.isSignedIn) return <></>;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        createComment.mutate({ content, commentPath });
      }}
      className="comment-form mb-7 mt-4 flex w-full rounded-xl border border-gray-200 p-4 pb-3"
    >
      <div>
        <Image
          src={auth?.user?.imageUrl ?? ""}
          className="mr-4 h-6 w-6 rounded-full"
          alt={`${auth?.user?.firstName}'s profile picture`}
          width={24}
          height={24}
        />
      </div>

      <div className="flex w-full flex-col justify-start">
        <input
          type="text"
          placeholder="Comment your thoughts"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-0 py-0 text-black outline-none "
        />

        <div className="mb-4 w-full border-b border-gray-200 pt-4" />

        <div className="flex justify-end">
          <button
            type="submit"
            className="primary-button font-semibold transition hover:bg-indigo-500"
            disabled={createComment.isLoading}
          >
            {createComment.isLoading ? "Commenting..." : "Comment"}
          </button>
        </div>
      </div>
    </form>
  );
}
