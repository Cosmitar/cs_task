"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

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
          <span className="ms-3 mb-1">{text}</span>
        </div>
      </Link>
    </li>
  );
};

export default function Sidebar() {
  const user = useUser();
  const profile = useUser();
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
            icon={
              <svg
                className="h-6 w-6"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M18.3334 14.1667V10.4538C18.3334 9.09868 18.3334 8.42113 18.1679 7.79394C18.0058 7.17971 17.7281 6.602 17.3498 6.09172C16.9634 5.57066 16.4343 5.1474 15.3762 4.30088L14.9976 3.99805L14.9976 3.99804C13.214 2.57117 12.3223 1.85774 11.3332 1.58413C10.4609 1.34279 9.53931 1.34279 8.66692 1.58413C7.67791 1.85774 6.78611 2.57118 5.00252 3.99805L5.00252 3.99805L4.62398 4.30088C3.56583 5.1474 3.03675 5.57066 2.6504 6.09172C2.27203 6.602 1.99437 7.17971 1.83227 7.79394C1.66675 8.42113 1.66675 9.09868 1.66675 10.4538V14.1667C1.66675 16.4679 3.53223 18.3333 5.83342 18.3333C6.75389 18.3333 7.50008 17.5871 7.50008 16.6667V13.3333C7.50008 11.9526 8.61937 10.8333 10.0001 10.8333C11.3808 10.8333 12.5001 11.9526 12.5001 13.3333V16.6667C12.5001 17.5871 13.2463 18.3333 14.1667 18.3333C16.4679 18.3333 18.3334 16.4679 18.3334 14.1667Z"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />

          {!user.isSignedIn && (
            <SideBarItem
              text="Sign In"
              link="/sign-up"
              icon={
                <svg
                  className="h-6 w-6"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"
                  />
                </svg>
              }
            />
          )}
          {user.isSignedIn && (
            <SideBarItem
              text="My Posts"
              link={`/posts/user/${user.user.id}`}
              highlighted={path === `/posts/user/${user.user.id}`}
              icon={
                <svg
                  className="h-6 w-6"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5.83317 6.66667H12.4998M5.83317 10H9.1665M15.5969 17.5249V17.5249C15.9995 17.7665 16.2008 17.8872 16.3548 17.9391C17.2011 18.2238 18.1071 17.7108 18.2984 16.8387C18.3332 16.6799 18.3332 16.4452 18.3332 15.9757V9.66667C18.3332 6.86641 18.3332 5.46628 17.7882 4.39672C17.3088 3.45591 16.5439 2.69101 15.6031 2.21164C14.5336 1.66667 13.1334 1.66667 10.3332 1.66667H9.1665C6.8368 1.66667 5.67194 1.66667 4.75309 2.04727C3.52795 2.55474 2.55458 3.52811 2.04711 4.75325C1.6665 5.67211 1.6665 6.83696 1.6665 9.16667V9.16667C1.6665 11.4964 1.6665 12.6612 2.04711 13.5801C2.55458 14.8052 3.52795 15.7786 4.75309 16.2861C5.67194 16.6667 6.8368 16.6667 9.1665 16.6667H12.4984C12.7793 16.6667 12.9198 16.6667 13.0577 16.6743C13.7759 16.714 14.4771 16.9082 15.1134 17.2437C15.2356 17.3081 15.356 17.3804 15.5969 17.5249Z"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
          )}
          <li className="fixed bottom-8 left-6 flex">
            <Image
              src={profile?.user?.imageUrl ?? ""}
              className="h-6 w-6 rounded-full"
              alt={`${profile?.user?.firstName}'s profile picture`}
              width={24}
              height={24}
            />
            <span className="ms-4 flex-1 whitespace-nowrap">
              {profile?.user?.firstName} {profile?.user?.lastName}
            </span>
          </li>
        </ul>
      </div>
    </aside>
  );
}
