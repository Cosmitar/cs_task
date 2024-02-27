import Image from "next/image";
import { type RouterOutputs, api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Fragment, useState } from "react";
import CommentForm from "../CommentForm/CommentForm";

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
    <div>
      {Object.keys(grouppedComments).map((path) => {
        const comments = grouppedComments[path];
        const depth = parseDepth(path);
        return depth === 1 ? (
          <Comments
            key={path}
            data={comments ?? []}
            hierarchyData={grouppedComments}
          />
        ) : (
          null
        );
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
  return data.map((fullCommentData) => (
    <Fragment key={fullCommentData.comment.id}>
      <Comment
        data={fullCommentData}
        depth={parseDepth(fullCommentData.comment?.commentPath ?? "")}
      />
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
    </Fragment>
  ));
};

const Comment = ({ data, depth }: { data: FullCommentData; depth: number }) => {
  const [voting, setVoting] = useState(false);
  const { comment, valuation, myVote } = data;

  const ctx = api.useUtils();
  const voteComment = api.comment.vote.useMutation({
    onSuccess: () => {
      void ctx.comment.getByPath.invalidate();
      setVoting(false);
    },
  });

  return (
    <div style={{ marginLeft: depth * 20 }}>
      <div className="flex">
        <Image
          src={data.author.imageUrl}
          className="h-6 w-6 rounded-full"
          alt={`${data.author.username}'s profile picture`}
          width={24}
          height={24}
        />
        <span className="">Posted by {data.author.username}</span>
        <span className="">{dayjs(data.comment.createdAt).fromNow()}</span>
      </div>
      <div>
        <button
          style={{ color: myVote > 0 ? "blue" : "inherit" }}
          disabled={voting}
          onClick={() => {
            !myVote &&
              voteComment.mutate({ commentId: comment.id, valuation: 1 });
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
            !myVote &&
              voteComment.mutate({ commentId: comment.id, valuation: -1 });
            setVoting(true);
          }}
        >
          ⥥
        </button>
        <ToggleCommentForm
          path={`${comment.commentPath}${COMMENT_PATH_SEPARATOR}${comment.id}`}
        />
      </div>
      <span className="">{data.comment.content}</span>
    </div>
  );
};

const ToggleCommentForm = ({ path }: { path: string }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <button onClick={() => setVisible((v) => !v)}>Reply</button>
      {visible && <CommentForm commentPath={path} />}
    </div>
  );
};
