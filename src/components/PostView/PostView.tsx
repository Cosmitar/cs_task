import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type RouterOutputs } from "~/utils/api";
import UpvoteArrow from "../SVG/UpvoteArrow";
import DownvoteArrow from "../SVG/DownvoteArrow";
import { useUser } from "@clerk/nextjs";

dayjs.extend(relativeTime);

type PostAndUser = RouterOutputs["post"]["getById"][number];
export default function PostView(props: PostAndUser) {
  const [voting, setVoting] = useState(false);
  const [votesCount, setVotesCount] = useState(0);
  const [myValuation, setMyValuation] = useState(0);

  const { post, author } = props;

  const ctx = api.useUtils();
  const votePost = api.post.vote.useMutation({
    onSuccess: () => {
      setVoting(false);
      void ctx.post.getLatest.invalidate();
      void ctx.post.getById.invalidate();
      void ctx.post.getByUser.invalidate();
    },
  });

  const auth = useUser();
  const canVote = auth.isSignedIn && !voting && !post.myVote;

  const valuation = Number(post.valuation);
  const myVote = post.myVote ?? 0;

  useEffect(() => {
    setVotesCount(valuation);
    setMyValuation(myVote);
  }, [valuation, myVote]);

  const castVote = (valuation: number) => {
    setVoting(true);
    !myValuation && votePost.mutate({ postId: post.id, valuation });
    // optimistic approach
    setVotesCount((v) => v + valuation);
    setMyValuation(valuation)

  };

  return (
    <>
      <div className="post-row animate-fade flex w-full">
        <div className="flex w-9 flex-col items-start justify-start">
          <div className="mt-1 flex flex-col items-center justify-start">
            <button
              className={`${myValuation > 0 && "text-indigo-500"} w-5 ${!auth.isSignedIn && "text-gray-400"}`}
              disabled={!canVote}
              onClick={() => castVote(1)}
            >
              <UpvoteArrow />
            </button>

            <span className="my-3">{votesCount}</span>

            <button
              className={`${myValuation < 0 && "text-indigo-500"} w-5 ${!auth.isSignedIn && "text-gray-400"}`}
              disabled={!canVote}
              onClick={() => castVote(-1)}
            >
              <DownvoteArrow />
            </button>
          </div>
        </div>

        <div className="flex w-full flex-col">
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

          <Link href={`/posts/${post.id}`}>
            <div className=" mt-1">
              <p className="text-base font-medium">{post.title}</p>
              <span className="text-sm">{post.content}</span>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
