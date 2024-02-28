import Image from "next/image";
import { type RouterOutputs, api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Fragment, useState } from "react";
import CommentForm from "../CommentForm/CommentForm";
import Link from "next/link";
import UpvoteArrow from "../SVG/UpvoteArrow";
import DownvoteArrow from "../SVG/DownvoteArrow";
import CommentBubbleIcon from "../SVG/CommentBubbleIcon";

dayjs.extend(relativeTime);

type FullCommentData = RouterOutputs["comment"]["getByPath"][number];

const COMMENT_PATH_SEPARATOR = "|";

const parseDepth = (commentPath: string) =>
  commentPath.split(COMMENT_PATH_SEPARATOR).length;

export default function CommentsList({ commentPath }: { commentPath: string }) {
  const { data, isLoading: postsLoading } = api.comment.getByPath.useQuery({
    commentPath,
  });

  const grouppedComments =
    data?.reduce<
      Record<FullCommentData["comment"]["commentPath"], FullCommentData[]>
    >((acc, data) => {
      if (!acc[data.comment.commentPath]) {
        acc[data.comment.commentPath] = [];
      }

      // @ts-expect-error nothig from the following line can be undefined :(
      acc[data.comment.commentPath].push(data);

      return acc;
    }, {}) ?? {};

  return (
    <div className="flex w-full flex-col">
      {Object.keys(grouppedComments).map((path) => {
        const comments = grouppedComments[path];
        const depth = parseDepth(path);
        return depth === 1 ? (
          <Comments
            key={path}
            data={comments ?? []}
            hierarchyData={grouppedComments}
          />
        ) : null;
      })}
    </div>
  );
}

const Comments = ({
  data,
  hierarchyData,
}: {
  data: FullCommentData[];
  hierarchyData: Record<string, FullCommentData[]>;
}) => {
  return data.map((fullCommentData) => {
    const depth = parseDepth(fullCommentData.comment?.commentPath ?? "");
    return (
      <div
        key={fullCommentData.comment.id}
        className={`flex w-full flex-col ${depth === 1 && " border-b pb-6"}`}
      >
        <Comment data={fullCommentData} depth={depth} />
        {hierarchyData[
          fullCommentData.comment.commentPath +
            COMMENT_PATH_SEPARATOR +
            fullCommentData.comment.id
        ] && (
          <Comments
            data={
              hierarchyData[
                fullCommentData.comment.commentPath +
                  COMMENT_PATH_SEPARATOR +
                  fullCommentData.comment.id
              ] ?? []
            }
            hierarchyData={hierarchyData}
          />
        )}
      </div>
    );
  });
};

const Comment = ({ data, depth }: { data: FullCommentData; depth: number }) => {
  const [voting, setVoting] = useState(false);
  const { comment, author, valuation, myVote } = data;
  const [showForm, setShowForm] = useState(false);

  const ctx = api.useUtils();
  const voteComment = api.comment.vote.useMutation({
    onSuccess: () => {
      void ctx.comment.getByPath.invalidate();
      setVoting(false);
    },
  });

  return (
    <>
      <div
        style={{ marginLeft: (depth - 1) * 32 }}
        className="mt-6 flex flex-col"
      >
        <div className="flex w-full flex-col">
          <Link href={`/posts/user/${author.id}`}>
            <div className="flex">
              <Image
                src={data.author.imageUrl}
                className="h-6 w-6 rounded-full"
                alt={`${data.author.username}'s profile picture`}
                width={24}
                height={24}
              />
              <div className="flex items-center text-sm text-gray-600">
                <span className="ml-2">Posted by {data.author.username}</span>
                <span className="ml-1">
                  {dayjs(data.comment.createdAt).fromNow()}
                </span>
              </div>
            </div>
          </Link>
        </div>
        <span className="my-3 text-sm">{data.comment.content}</span>
        <div className="flex w-full">
          <button
            className={`${myVote > 0 && "text-indigo-500"} w-4`}
            disabled={voting}
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
            className={`${myVote < 0 && "text-indigo-500"} w-4`}
            disabled={voting}
            onClick={() => {
              !myVote &&
                voteComment.mutate({ commentId: comment.id, valuation: -1 });
              setVoting(true);
            }}
          >
            <DownvoteArrow />
          </button>
          <button
            className={`mx-4 flex w-full items-center ${showForm ? "text-indigo-600" : "text-gray-700"} `}
            onClick={() => setShowForm((v) => !v)}
          >
            <CommentBubbleIcon />
            <span className="mx-2 text-sm">Reply</span>
          </button>
        </div>
        <ToggleCommentForm
          visible={showForm}
          path={`${comment.commentPath}${COMMENT_PATH_SEPARATOR}${comment.id}`}
        />
      </div>
    </>
  );
};

const ToggleCommentForm = ({
  path,
  visible,
}: {
  path: string;
  visible: boolean;
}) => {
  return <div>{visible && <CommentForm commentPath={path} />}</div>;
};
