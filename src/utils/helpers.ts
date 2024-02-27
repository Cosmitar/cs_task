import type { User } from "@clerk/nextjs/server";

export const getDisplayName = (user: User) =>
  `${user.firstName} ${user.lastName?.substring(0, 1)}.`;

export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: getDisplayName(user),
    imageUrl: user.imageUrl,
  };
};
