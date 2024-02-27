import Head from "next/head";
import { useRouter } from "next/router";
import PostView from "~/components/PostView/PostView";
import { api } from "~/utils/api";

const User = () => {
  const router = useRouter();

  const { data, isLoading: postsLoading } = api.post.getByUser.useQuery({
    authorId: router.query.slug as string,
  });

  return (
    <>
      <Head>
        <title>CS - User Posts</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          USER POSTS: {router.query.slug}
          {data?.map((postAndAuthor) => (
            <PostView key={postAndAuthor.post.id} {...postAndAuthor} />
          ))}
        </div>
      </main>
    </>
  );
};

export default User;
