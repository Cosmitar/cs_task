import Head from "next/head";
import { PostForm } from "~/components/PostForm/PostForm";
import PostView from "~/components/PostView/PostView";
import Sidebar from "~/components/Sidebar/Sidebar";

import { api } from "~/utils/api";

export default function Posts() {
  return (
    <>
      <Head>
        <title>CS</title>
        <meta name="description" content="CS Test Task" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Sidebar />
      <main className="main-container">
        <PostsList />
      </main>
    </>
  );
}

const PostsList = () => {
  const { data } = api.post.getLatest.useQuery();

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
