import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import type { RouterOutputs } from "~/utils/api";

dayjs.extend(relativeTime);

type PostAndUser = RouterOutputs["post"]["getLatest"][number];
export default function PostView(props: PostAndUser) {
  const { post, author } = props;

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
        <span>⥣</span> 0<span>⥥</span>
      </div>
      <Link href={`/posts/${post.id}`}>
        <p>{post.title}</p>
        <span className="">{post.content}</span>
      </Link>
    </>
  );
}
