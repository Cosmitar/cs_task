"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import HomeIcon from "../SVG/HomeIcon";
import SignInIcon from "../SVG/SignInIcon";
import MessageBubbleIcon from "../SVG/MessageBubbleIcon";

const SideBarItem = ({
  icon,
  text,
  link,
  highlighted,
}: {
  icon: ReactNode;
  text: string;
  link: string;
  highlighted?: boolean;
}) => {
  return (
    <li>
      <Link href={link}>
        <div
          className={`group flex items-center rounded-lg p-3 pl-4 pr-4 hover:bg-gray-50 ${highlighted && "text-highlighted"}`}
        >
          {icon}

          <span className="mb-1 ms-3">{text}</span>
        </div>
      </Link>
    </li>
  );
};

export default function Sidebar() {
  const auth = useUser();
  const path = usePathname();

  return (
    <aside
      id="default-sidebar"
      className="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full border-r  border-gray-200  pl-4 pr-4 pt-6 transition-transform sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="h-full overflow-y-auto">
        <ul className="space-y-2 font-medium">
          <SideBarItem
            text="Home"
            link="/"
            highlighted={path === "/"}
            icon={<HomeIcon />}
          />

          {!auth.isSignedIn && (
            <SideBarItem text="Sign In" link="/signup" icon={<SignInIcon />} />
          )}

          {auth.isSignedIn && (
            <SideBarItem
              text="My Posts"
              link={`/posts/user/${auth.user.id}`}
              highlighted={path === `/posts/user/${auth.user.id}`}
              icon={<MessageBubbleIcon />}
            />
          )}

          {auth.isSignedIn && (
            <li className="fixed bottom-8 left-6 flex">
              <Image
                src={auth?.user?.imageUrl ?? ""}
                className="h-6 w-6 rounded-full"
                alt={`${auth?.user?.firstName}'s profile picture`}
                width={24}
                height={24}
              />

              <span className="ms-4 flex-1 whitespace-nowrap">
                {auth?.user?.firstName} {auth?.user?.lastName}
              </span>
            </li>
          )}
        </ul>
      </div>
    </aside>
  );
}
