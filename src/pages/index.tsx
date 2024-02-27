import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Head from "next/head";

import { api } from "~/utils/api";

export default function Home() {
  const user = useUser();

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          {!user.isSignedIn && <SignInButton />}
          {user.isSignedIn && <SignOutButton />}
          <CrudShowcase />
        </div>
      </main>
    </>
  );
}

const CrudShowcase = () => {
  const { data, isLoading: postsLoading } = api.post.getLatest.useQuery();

  return <div className="w-full max-w-xs">
    {data?.map((postAndAuthor) => (
        <div key={postAndAuthor.post.id}>
          <span>{postAndAuthor.post.title}</span>
          <span>{postAndAuthor.post.content}</span>
        </div>
      ))}
  </div>;
};
