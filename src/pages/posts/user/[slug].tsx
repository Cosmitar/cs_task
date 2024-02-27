import Head from "next/head";
import { useRouter } from "next/router";

const User = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>CS - User Posts</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          USER POSTS: {router.query.slug}
        </div>
      </main>
    </>
  );
};

export default User;
