import Head from "next/head";
import Link from "next/link";
import CommentForm from "~/components/CommentForm/CommentForm";
import CommentsList from "~/components/CommentsList/CommentsList";
import PostView from "~/components/PostView/PostView";
import BackArrow from "~/components/SVG/BackArrow";
import Sidebar from "~/components/Sidebar/Sidebar";
import { api } from "~/utils/api";

const Post = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  const { id } = props;

  const { data } = api.post.getById.useQuery({
    postId: id,
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
            <div className="mb-7">
              <PostView {...fullPostInfo} />
            </div>

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

import { createServerSideHelpers } from "@trpc/react-query/server";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import superjson from "superjson";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ id: string }>,
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {db, userId: null},
    transformer: superjson,
  });
  const id = context.params?.id;
  /*
   * Prefetching the `post.getById` query.
   * `prefetch` does not return the result and never throws - if you need that behavior, use `fetch` instead.
   */
  await helpers.post.getById.prefetch({ postId: id });
  // Make sure to return { props: { trpcState: helpers.dehydrate() } }
  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    },
  };
}
