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
  return (
    <div
      style={{ marginLeft: (depth - 1) * 32 }}
      className="mt-6 flex flex-col"
    >
      <CommentHeader data={data} />

      <span className="my-3 text-sm">{data.comment.content}</span>

      <CommentFooter data={data} />
    </div>
  );
}
