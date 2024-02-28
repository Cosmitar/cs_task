import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { api, type RouterOutputs } from "~/utils/api";
import UpvoteArrow from "../SVG/UpvoteArrow";
import DownvoteArrow from "../SVG/DownvoteArrow";

dayjs.extend(relativeTime);

type PostAndUser = RouterOutputs["post"]["getById"][number];
export default function PostView(props: PostAndUser) {
  const [voting, setVoting] = useState(false);
  const { post, author, valuation, myVote } = props;

  const ctx = api.useUtils();
  const votePost = api.post.vote.useMutation({
    onSuccess: () => {
      setVoting(false);
      void ctx.post.getLatest.invalidate();
    },
  });

  return (
    <>
      <div className="post-row flex w-full">
        <div className="flex w-9 flex-col items-start justify-start">
          <div className="flex flex-col items-center justify-start mt-1">
            <button
              className={`${myVote > 0 && "text-indigo-500"}`}
              // style={{ color: myVote > 0 ? "blue" : "inherit" }}
              disabled={voting}
              onClick={() => {
                !myVote && votePost.mutate({ postId: post.id, valuation: 1 });
                setVoting(true);
              }}
            >
              <UpvoteArrow />
            </button>
            <span className="my-3">{valuation}</span>
            <button
              className={`${myVote < 0 && "text-indigo-500"}`}
              // style={{ color: myVote < 0 ? "blue" : "inherit" }}
              disabled={voting}
              onClick={() => {
                !myVote && votePost.mutate({ postId: post.id, valuation: -1 });
                setVoting(true);
              }}
            >
              <DownvoteArrow />
            </button>
          </div>
        </div>
        <div className="flex flex-col w-full">
          <Link href={`/posts/user/${author.id}`}>
            <div className="flex">
              <Image
                src={author.imageUrl}
                className="h-6 w-6 rounded-full"
                alt={`${author.username}'s profile picture`}
                width={24}
                height={24}
              />
              <div className="flex items-center text-sm text-gray-600">
                <span className="ml-2">Posted by {author.username}</span>
                <span className="ml-1">{dayjs(post.createdAt).fromNow()}</span>
              </div>
            </div>
          </Link>

          <div className=" mt-1">
            <Link href={`/posts/${post.id}`}>
              <p className="text-base font-medium">{post.title}</p>
              <span className="text-sm">{post.content}</span>
            </Link>
          </div>
        </div>
      </div>
      {/* <div className="flex h-1 w-full border-b " /> */}
    </>
  );
}
