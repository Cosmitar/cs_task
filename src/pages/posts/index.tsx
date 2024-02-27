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
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <CrudShowcase />
        </div>
      </main>
    </>
  );
}

const CrudShowcase = () => {
  const { data, isLoading: postsLoading } = api.post.getLatest.useQuery();

  return (
    <div>
      <div className="w-full max-w-xs">
        {data?.map((postAndAuthor) => (
          <PostView key={postAndAuthor.post.id} {...postAndAuthor} />
        ))}
      </div>
      <PostForm />
    </div>
  );
};
