import CommentFooter from "./CommentFooter";
import CommentHeader from "./CommentHeader";
import type { FullCommentData } from "./types";

export default function Comment({
  data,
  depth,
}: {
  data: FullCommentData;
  depth: number;
}) {
  const indentWidth = 32;
  const maxIndent = 10 * indentWidth; // max 10 indents

  return (
    <div
      style={{
        marginLeft: Math.min((depth - 1) * indentWidth, maxIndent),
      }}
      className="mt-6 flex flex-col"
    >
      <CommentHeader data={data} />

      <span className="my-3 text-sm">{data.comment.content}</span>

      <CommentFooter data={data} />
    </div>
  );
}
