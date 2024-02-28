import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

import type { FullCommentData } from "./types";

export default function CommentHeader({ data }: { data: FullCommentData }) {
  const { author } = data;

  return (
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
  );
}
