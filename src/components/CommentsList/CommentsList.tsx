import { api } from "~/utils/api";
import type { FullCommentData } from "./types";
import { buildPath, parseDepth } from "./helpers";
import Comment from "./Comment";

export default function CommentsList({ commentPath }: { commentPath: string }) {
  const { data } = api.comment.getByPath.useQuery({
    commentPath,
  });

  // loops into results and groups comments by path
  const grouppedComments =
    data?.reduce<
      Record<FullCommentData["comment"]["commentPath"], FullCommentData[]>
    >((acc, data) => {
      if (!acc[data.comment.commentPath]) {
        acc[data.comment.commentPath] = [];
      }
      // this object reference is defined by previous line, then we calm TS by using !
      acc[data.comment.commentPath]!.push(data);

      return acc;
    }, {}) ?? {};

  // iterates on grouped comments taking only those from the shallow (depth === 1).
  // nested comments are rendered in a recursive call from <Comments /> component.
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

    const hasNested =
      !!hierarchyData[
        buildPath(
          fullCommentData.comment.commentPath,
          fullCommentData.comment.id,
        )
      ];

    return (
      <div
        key={fullCommentData.comment.id}
        className={`flex w-full flex-col ${depth === 1 && " border-b pb-6"}`}
      >
        <Comment data={fullCommentData} depth={depth} />

        {hasNested && (
          // recursive call
          <Comments
            data={
              hierarchyData[
                buildPath(
                  fullCommentData.comment.commentPath,
                  fullCommentData.comment.id,
                )
              ] ?? []
            }
            hierarchyData={hierarchyData}
          />
        )}
      </div>
    );
  });
};
