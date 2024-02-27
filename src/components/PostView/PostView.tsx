import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { api, type RouterOutputs } from "~/utils/api";

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
      <Link href={`/posts/user/${author.id}`}>
        <div className="flex">
          <Image
            src={author.imageUrl}
            className="h-6 w-6 rounded-full"
            alt={`${author.username}'s profile picture`}
            width={24}
            height={24}
          />
          <span className="">Posted by {author.username}</span>
          <span className="">{dayjs(post.createdAt).fromNow()}</span>
        </div>
      </Link>
      <div>
        <button
          style={{ color: myVote > 0 ? "blue" : "inherit" }}
          disabled={voting}
          onClick={() => {
            !myVote && votePost.mutate({ postId: post.id, valuation: 1 });
            setVoting(true);
          }}
        >
          ⥣
        </button>
        {valuation}
        <button
          style={{ color: myVote < 0 ? "blue" : "inherit" }}
          disabled={voting}
          onClick={() => {
            !myVote && votePost.mutate({ postId: post.id, valuation: -1 });
            setVoting(true);
          }}
        >
          ⥥
        </button>
      </div>
      <Link href={`/posts/${post.id}`}>
        <p>{post.title}</p>
        <span className="">{post.content}</span>
      </Link>
    </>
  );
}
