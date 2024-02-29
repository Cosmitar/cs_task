"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useState } from "react";
import { api } from "~/utils/api";

export function PostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const ctx = api.useUtils();
  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      void ctx.post.getLatest.invalidate();
      setTitle("");
      setContent("");
    },
  });

  const auth = useUser();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        createPost.mutate({ title, content });
      }}
      className={`post-form mt-10 flex w-full overflow-hidden rounded-xl border border-gray-200 p-4 pb-3	transition-all	duration-500 ${auth.isSignedIn ? "min-h-40" : "collapse mt-0 min-h-0 border-0 p-0"} h-0`}
    >
      <div className={`flex w-full transition-all	duration-500 delay-500 ${auth.isSignedIn ? "opacity-1" : "opacity-0"}`}>
        <div>
          <Image
            src={auth?.user?.imageUrl ?? ""}
            className="mr-4 h-6 w-6 rounded-full"
            alt={`${auth?.user?.firstName}'s profile picture`}
            width={24}
            height={24}
          />
        </div>

        <div className="w-full">
          <input
            type="text"
            placeholder="Title of your post"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-0 py-0 text-black outline-none "
          />

          <input
            type="text"
            placeholder="Share your thoughts with the world!"
            multiple
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-0 py-2 text-black outline-none"
          />

          <div className="w-full border-b border-gray-200" />

          <div className="mt-4 flex w-full items-center justify-end">
            <button
              type="submit"
              className="primary-button font-semibold transition hover:bg-indigo-500"
              disabled={createPost.isLoading}
            >
              {createPost.isLoading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
