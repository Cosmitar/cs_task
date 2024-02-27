import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/server";
import type { Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(140),
        content: z.string().min(1).max(250),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      const authorId = ctx.userId!;

      return ctx.db.post.create({
        data: {
          title: input.title,
          content: "content test",
          authorId,
        },
      });
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return postsWithAuthor(posts);
  }),
});

const postsWithAuthor = async (posts: Post[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.reduce<string[]>(
        (ids, p) =>
          ids.includes(p.authorId as string)
            ? ids
            : [...ids, p.authorId as string],
        [],
      ),
    })
  ).map(filterUserForClient);

  return posts.map((post) => {
    const author = users.find((u) => u.id === post.authorId);

    if (!author)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Post author not found",
      });

    return {
      post,
      author,
    };
  });
};

const getDisplayName = (user: User) =>
  `${user.firstName} ${user.lastName?.substring(0, 1)}.`;

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: getDisplayName(user),
    imageUrl: user.imageUrl,
  };
};
