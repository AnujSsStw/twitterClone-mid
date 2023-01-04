import { string, TypeOf, z } from "zod";
import { TweetTextType } from "../../../components/tweetForm";

import { router, protectedProcedure, publicProcedure } from "../trpc";

export const tweetRouter = router({
  createTweet: protectedProcedure
    .input(TweetTextType)
    .mutation(({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const data = ctx.prisma.tweet.create({
        data: {
          author: {
            connect: {
              id: userId,
            },
          },
          text: input.text,
        },
      });

      return data;
    }),
  getAllTweet: publicProcedure
    .input(
      z.object({
        limit: z.number().max(50).default(10),
        cursor: z.string().nullish(),
        filterId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const { limit, cursor, filterId } = input;

      const userId = session?.user?.id;

      const data = await prisma.tweet.findMany({
        where: {
          author: {
            name: filterId,
          },
        },
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
        take: limit + 1,
        include: {
          author: {
            select: {
              image: true,
              name: true,
            },
          },
          like: {
            where: {
              userId: userId ? userId : "",
            },
            select: {
              userId: true,
            },
          },
          _count: {
            select: { like: true },
          },
        },
        cursor: cursor ? { id: cursor } : undefined,
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (data.length > limit) {
        const nextId = data.pop();
        nextCursor = nextId?.id;
      }

      return {
        data,
        nextCursor,
      };
    }),
  like: protectedProcedure
    .input(
      z.object({
        tweetId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const userId = session.user.id;

      const data = await prisma.like.create({
        data: {
          tweet: {
            connect: {
              id: input.tweetId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });

      return data;
    }),
  unLike: protectedProcedure
    .input(
      z.object({
        tweetId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;
      const userId = session.user.id;

      const data = await prisma.like.delete({
        where: {
          tweetId_userId: {
            tweetId: input.tweetId,
            userId,
          },
        },
      });

      return data;
    }),
});
