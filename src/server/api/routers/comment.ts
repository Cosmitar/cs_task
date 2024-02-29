import { clerkClient } from "@clerk/nextjs";
import type { Comment } from "@prisma/client";
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

type CommentWithVotesInfo = Comment & {
  valuation: number | null;
  myVote: number | null;
};

export const commentRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        content: z.string().min(1).max(250),
        commentPath: z.string().min(10),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await ratelimitComment.limit(authorId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      return ctx.db.comment.create({
        data: {
          content: input.content,
          commentPath: input.commentPath,
          authorId,
        },
      });
    }),

  vote: privateProcedure
    .input(z.object({ commentId: z.string(), valuation: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await ratelimitVote.limit(
        `${authorId}-${input.commentId}`,
      );
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      return ctx.db.vote.create({
        data: {
          comment: { connect: { id: input.commentId } },
          value: input.valuation,
          authorId,
        },
      });
    }),

  getByPath: publicProcedure
    .input(z.object({ commentPath: z.string() }))
    .query(async ({ ctx, input }) => {
      const PATH_LIKE = `${input.commentPath}%`
      const res = await ctx.db.$queryRaw<CommentWithVotesInfo[]>`
        SELECT
            c.*, CAST(SUM(v.value) AS SIGNED INTEGER) as valuation,
            (SELECT
              v2.value
            FROM Vote as v2
            WHERE
              v2.commentId = c.id
              AND v2.authorId = ${ctx.userId}
            LIMIT 1) as myVote
          FROM Comment as c
          LEFT JOIN Vote as v ON v.commentId = c.id
          
          WHERE c.commentPath LIKE ${PATH_LIKE}
          GROUP BY c.id
          ORDER BY c.createdAt DESC
          LIMIT 100`;

      return await commentsWithAuthor(res);
    }),
});

const commentsWithAuthor = async (comments: CommentWithVotesInfo[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: comments.reduce<string[]>(
        (ids, p) => (ids.includes(p.authorId) ? ids : [...ids, p.authorId]),
        [],
      ),
    })
  ).map(filterUserForClient);

  return comments.map((comment) => {
    const author = users.find((u) => u.id === comment.authorId);

    if (!author)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Comment author not found",
      });

    return {
      comment,
      author,
    };
  });
};

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimitComment = new Ratelimit({
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
