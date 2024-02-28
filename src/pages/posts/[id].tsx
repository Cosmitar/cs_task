import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment } from "react";
import CommentForm from "~/components/CommentForm/CommentForm";
import CommentsList from "~/components/CommentsList/CommentsList";
import PostView from "~/components/PostView/PostView";
import BackArrow from "~/components/SVG/BackArrow";
import Sidebar from "~/components/Sidebar/Sidebar";
import { api } from "~/utils/api";

const Post = () => {
  const router = useRouter();

  const { data, isLoading: postsLoading } = api.post.getById.useQuery({
    postId: router.query.id as string,
  });
  const fullPostInfo = data ? data[0] : null;

  return (
    <>
      <Head>
        <title>CS - Post</title>
      </Head>
      <Sidebar />
      <main className="main-container pt-6">
        <Link href="/" className="flex h-10 w-full items-center justify-start">
          <BackArrow />
          <span className="ml-4 text-sm text-gray-800">Back to posts</span>
        </Link>
        {fullPostInfo && (
          <div key={fullPostInfo.post.id} className="my-7 w-full">
            <PostView {...fullPostInfo} />
            <CommentForm commentPath={fullPostInfo.post.id} />
            <div className="w-full border-b border-gray-200" />
            <div className="my-7 w-full">All comments</div>
            <CommentsList commentPath={fullPostInfo.post.id} />
          </div>
        )}
      </main>
    </>
  );
};

export default Post;
