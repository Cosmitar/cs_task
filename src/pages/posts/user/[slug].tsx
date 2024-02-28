import Head from "next/head";
import { useRouter } from "next/router";
import { PostForm } from "~/components/PostForm/PostForm";
import PostView from "~/components/PostView/PostView";
import Sidebar from "~/components/Sidebar/Sidebar";
import { api } from "~/utils/api";

const User = () => {
  const router = useRouter();
  const authorId = router.query.slug as string;

  return (
    <>
      <Head>
        <title>CS - User Posts</title>
      </Head>
      <Sidebar />
      <main className="main-container">
        {authorId && <PostsListByUser authorId={authorId} />}
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
      <div className="w-full  [&>*:first-child]:mt-0 [&>*]:mt-10">
        {data?.map((postAndAuthor) => (
          <PostView key={postAndAuthor.post.id} {...postAndAuthor} />
        ))}
      </div>
    </>
  );
};
