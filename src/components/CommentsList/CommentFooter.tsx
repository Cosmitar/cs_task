import { useState } from "react";
import type { FullCommentData } from "./types";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import UpvoteArrow from "../SVG/UpvoteArrow";
import DownvoteArrow from "../SVG/DownvoteArrow";
import CommentBubbleIcon from "../SVG/CommentBubbleIcon";
import CommentForm from "../CommentForm/CommentForm";
import { buildPath } from "./helpers";

export default function CommentFooter({ data }: { data: FullCommentData }) {
  const [voting, setVoting] = useState(false);
  const { comment, valuation, myVote } = data;
  const [showForm, setShowForm] = useState(false);

  const ctx = api.useUtils();
  const voteComment = api.comment.vote.useMutation({
    onSuccess: () => {
      void ctx.comment.getByPath.invalidate();
      setVoting(false);
    },
  });

  const auth = useUser();
  const canVote = auth.isSignedIn && !voting;

  return (
    <>
      <div className="flex w-full">
        <button
          className={`${myVote > 0 && "text-indigo-500"} w-4 disabled:text-gray-400`}
          disabled={!canVote}
          onClick={() => {
            !myVote &&
              voteComment.mutate({ commentId: comment.id, valuation: 1 });
            setVoting(true);
          }}
        >
          <UpvoteArrow />
        </button>

        <span className="mx-3">{valuation}</span>

        <button
          className={`${myVote < 0 && "text-indigo-500"} w-4 disabled:text-gray-400`}
          disabled={!canVote}
          onClick={() => {
            !myVote &&
              voteComment.mutate({ commentId: comment.id, valuation: -1 });
            setVoting(true);
          }}
        >
          <DownvoteArrow />
        </button>

        <button
          className={`mx-4 flex w-full items-center ${showForm ? "text-indigo-600" : "text-gray-700"} disabled:text-gray-400`}
          onClick={() => setShowForm((v) => !v)}
          disabled={!auth.isSignedIn}
        >
          <CommentBubbleIcon />

          <span className="mx-2 text-sm">Reply</span>
        </button>
      </div>
      {showForm && (
        <CommentForm commentPath={buildPath(comment.commentPath, comment.id)} />
      )}
    </>
  );
}
