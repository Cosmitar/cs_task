import { useEffect, useState } from "react";
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
  const [votesCount, setVotesCount] = useState(0);
  const [myValuation, setMyValuation] = useState(0);
  const { comment } = data;
  const [showForm, setShowForm] = useState(false);

  const ctx = api.useUtils();
  const voteComment = api.comment.vote.useMutation({
    onSuccess: () => {
      void ctx.comment.getByPath.invalidate();
      setVoting(false);
    },
  });

  const auth = useUser();
  const canVote = auth.isSignedIn && !voting && !comment.myVote;

  const myVote = comment.myVote ?? 0;
  const valuation = Number(comment.valuation);

  useEffect(() => {
    setVotesCount(valuation);
    setMyValuation(myVote);
  }, [valuation, myVote]);

  const castVote = (valuation: number) => {
    setVoting(true);
    !myValuation && voteComment.mutate({ commentId: comment.id, valuation });

    // optimistic approach
    setVotesCount((v) => v + valuation);
    setMyValuation(valuation);
  };

  return (
    <>
      <div className="flex w-full">
        <button
          className={`${myValuation > 0 && "text-indigo-500"} w-4 ${!auth.isSignedIn && "text-gray-400"}`}
          disabled={!canVote}
          onClick={() => castVote(1)}
        >
          <UpvoteArrow />
        </button>

        <span className="mx-3">{votesCount}</span>

        <button
          className={`${myValuation < 0 && "text-indigo-500"} w-4 ${!auth.isSignedIn && "text-gray-400"}`}
          disabled={!canVote}
          onClick={() => castVote(-1)}
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
      <div
        className={`transition-all	duration-300 ${showForm ? "min-h-40 delay-0" : "collapse min-h-0 delay-300"} h-0`}
      >
        <div
          className={`transition-all	duration-300 ${showForm ? "opacity-1 delay-300" : "opacity-0 delay-0"} h-0`}
        >
          <CommentForm
            commentPath={buildPath(comment.commentPath, comment.id)}
          />
        </div>
      </div>
    </>
  );
}
