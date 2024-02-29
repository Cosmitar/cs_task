import { clerkClient } from "@clerk/nextjs";
import type { Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis"; // see below for cloudflare and fastly adapters
import { filterUserForClient } from "~/utils/helpers";

type PostWithVotesInfo = Post & {
  valuation: number | null;
  myVote: number | null;
};

export const postRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        title: z.string().min(1).max(140),
        content: z.string().min(1).max(250),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await ratelimitPost.limit(authorId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      return ctx.db.post.create({
        data: {
          title: input.title,
          content: input.content,
          authorId,
        },
      });
    }),

  vote: privateProcedure
    .input(z.object({ postId: z.string(), valuation: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await ratelimitVote.limit(
        `${authorId}-${input.postId}`,
      );
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      return ctx.db.vote.create({
        data: {
          post: { connect: { id: input.postId } },
          value: input.valuation,
          authorId,
        },
      });
    }),

  getById: publicProcedure
    .input(z.object({ postId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.db.$queryRaw<PostWithVotesInfo[]>`
        SELECT
          p.*, CAST(SUM(v.value) AS SIGNED INTEGER) as valuation,
          (SELECT
            v2.value
          FROM Vote as v2
          WHERE
            v2.postId = p.id
            AND v2.authorId = ${ctx.userId}
          LIMIT 1) as myVote
        FROM Post as p
        LEFT JOIN Vote as v ON v.postId = p.id          
        WHERE p.id LIKE ${input.postId}
        GROUP BY p.id
        LIMIT 1`;

      if (!res.length) throw new TRPCError({ code: "NOT_FOUND" });

      return await postsWithAuthor(res);
    }),

  getByUser: publicProcedure
    .input(z.object({ authorId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.db.$queryRaw<PostWithVotesInfo[]>`
        SELECT
          p.*, CAST(SUM(v.value) AS SIGNED INTEGER) as valuation,
          (SELECT
            v2.value
          FROM Vote as v2
          WHERE
            v2.postId = p.id
            AND v2.authorId = ${ctx.userId}
          LIMIT 1) as myVote
        FROM Post as p
        LEFT JOIN Vote as v ON v.postId = p.id          
        WHERE p.authorId LIKE ${input.authorId}
        GROUP BY p.id
        ORDER BY p.createdAt DESC
        LIMIT 100`;

      return await postsWithAuthor(res);
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const res = await ctx.db.$queryRaw<PostWithVotesInfo[]>`
      SELECT
          p.*, CAST(SUM(v.value) AS SIGNED INTEGER) as valuation,
          (SELECT
            v2.value
          FROM Vote as v2
          WHERE
            v2.postId = p.id
            AND v2.authorId = ${ctx.userId}
          LIMIT 1) as myVote
        FROM Post as p
        LEFT JOIN Vote as v ON v.postId = p.id
        GROUP BY p.id
        ORDER BY p.createdAt DESC
        LIMIT 100`;

    return await postsWithAuthor(res);
  }),
});

const postsWithAuthor = async (posts: PostWithVotesInfo[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.reduce<string[]>(
        (ids, p) => (ids.includes(p.authorId) ? ids : [...ids, p.authorId]),
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

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimitPost = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

// Create a new ratelimiter, that allows 1 request per second
const ratelimitVote = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1, "1 s"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});
