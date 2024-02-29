import { clerkClient } from "@clerk/nextjs";
import type { Post, Vote, Prisma } from "@prisma/client";
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

type PostWithVotes = Prisma.PostGetPayload<{ include: { votes: true } }>;

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
      const post = await ctx.db.post.findFirst({
        include: {
          votes: true,
        },
        where: {
          id: input.postId,
        },
      });

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      return await postsWithAuthorAndVotes([post], ctx.userId ?? "");
    }),

  getByUser: publicProcedure
    .input(z.object({ authorId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db.post.findMany({
        include: {
          votes: true,
        },
        where: {
          authorId: input.authorId,
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      return await postsWithAuthorAndVotes(posts, ctx.userId ?? "");
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      include: {
        votes: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return await postsWithAuthorAndVotes(posts, ctx.userId ?? "");
  }),
});

const postsWithAuthorAndVotes = async (
  posts: PostWithVotes[],
  currentUserId: string,
) => {
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

    // final valuation across all the votes
    // @TODO: this calculations should be DB queries
    let valuation = 0;
    let myVote = 0;

    post.votes.forEach((v: Vote) => {
      // save current user vote for later
      if (v.authorId === currentUserId && v.value) {
        myVote = v.value;
      }
      // cumulate value
      valuation += v.value;
    });

    return {
      post,
      author,
      valuation,
      myVote,
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
