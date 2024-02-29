import Head from "next/head";
import { PostForm } from "~/components/PostForm/PostForm";
import PostView from "~/components/PostView/PostView";
import Sidebar from "~/components/Sidebar/Sidebar";
import { api } from "~/utils/api";

const User = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  const { slug } = props;

  return (
    <>
      <Head>
        <title>CS - User Posts</title>
      </Head>

      <Sidebar />

      <main className="main-container">
        {slug && <PostsListByUser authorId={slug} />}
      </main>
    </>
  );
};

export default User;

const PostsListByUser = ({ authorId }: { authorId: string }) => {
  const { data } = api.post.getByUser.useQuery({
    authorId,
  });

  return (
    <>
      <PostForm />

      <div className="w-full  [&>*]:mt-10">
        {data?.map((postAndAuthor) => (
          <PostView key={postAndAuthor.post.id} {...postAndAuthor} />
        ))}
      </div>
    </>
  );
};

import { createServerSideHelpers } from "@trpc/react-query/server";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import superjson from "superjson";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ slug: string }>,
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId: null },
    transformer: superjson,
  });
  const slug = context.params?.slug;
  /*
   * Prefetching the `post.getByUser` query.
   * `prefetch` does not return the result and never throws - if you need that behavior, use `fetch` instead.
   */
  await helpers.post.getByUser.prefetch({ authorId: slug });
  // Make sure to return { props: { trpcState: helpers.dehydrate() } }
  return {
    props: {
      trpcState: helpers.dehydrate(),
      slug,
    },
  };
}
