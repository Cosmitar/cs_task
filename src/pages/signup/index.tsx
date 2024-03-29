import { SignInButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import GoogleSSOButton from "~/components/SVG/GoogleSSOButton";

export default function SignUp() {
  const auth = useUser();
  const router = useRouter();

  useEffect(() => {
    if (auth.isSignedIn) router.push("/");
  }, [auth, router]);

  return (
    <>
      <Head>
        <title>CS - Welcome</title>
      </Head>

      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex w-auto flex-col items-start justify-center">
          <h1 className="mb-2">Join the best community ever</h1>

          <h2>Create an account today</h2>

          <SignInButton>
            <div className="my-7 cursor-pointer">
              <GoogleSSOButton />
            </div>
          </SignInButton>

          <div className="text-base text-gray-700">
            Already have an account?
            <span className="m-1 font-medium text-indigo-950">
              <SignInButton
                afterSignInUrl="/"
                afterSignUpUrl="/"
                redirectUrl="/"
              />
            </span>
          </div>
        </div>
      </main>
    </>
  );
}
