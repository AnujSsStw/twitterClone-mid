import {
  InfiniteData,
  QueryClient,
  useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { AiFillHeart } from "react-icons/ai";
import InfiniteScroll from "react-infinite-scroll-component";
import { RouterOutputs, trpc } from "../utils/trpc";
import { updateCache } from "../utils/updateCache";

export const TimeLine = ({ filterId }: { filterId?: string }) => {
  const { data, hasNextPage, fetchNextPage, isFetching } =
    trpc.tweet.getAllTweet.useInfiniteQuery(
      {
        limit: 10,
        filterId,
      },
      {
        getNextPageParam: (page) => page.nextCursor,
        refetchOnWindowFocus: false,
      }
    );
  const client = useQueryClient();
  const tweets = data?.pages.flatMap((item) => item.data) ?? [];

  // const scrollPosition = InfiniteScrollHook();
  // useEffect(() => {
  //   if (scrollPosition > 90 && hasNextPage && !isFetching) {
  //     fetchNextPage();
  //   }
  // }, [scrollPosition, hasNextPage, isFetching, fetchNextPage]);

  return (
    <div className="relative">
      <InfiniteScroll
        dataLength={tweets.length}
        next={() => fetchNextPage()}
        hasMore={hasNextPage as boolean}
        loader={<h3> Loading...</h3>}
        endMessage={<h4>Nothing more to show</h4>}
      >
        {tweets.map((data, idx) => (
          <Stack
            data={data}
            key={idx}
            client={client}
            filterId={filterId as string}
          />
        ))}
      </InfiniteScroll>
    </div>
  );
};

const Stack = ({
  data,
  client,
  filterId,
}: {
  data: RouterOutputs["tweet"]["getAllTweet"]["data"][number];
  client: QueryClient;
  filterId: string;
}) => {
  const hasLiked = data.like.length > 0;

  const { mutateAsync: likeIt } = trpc.tweet.like.useMutation({
    onMutate: (newD) => {
      updateCache({
        action: "like",
        client,
        inputs: filterId,
        variables: newD,
        data: {
          userId: data.authorId,
        },
      });
    },
  });
  const { mutateAsync: unLikeIt } = trpc.tweet.unLike.useMutation({
    onSuccess: (data, variables: { tweetId: string }) => {
      updateCache({
        client,
        data,
        variables,
        action: "unlike",
        inputs: filterId,
      });
    },
  });

  const router = useRouter();
  const { data: sessionData } = useSession();

  return (
    <div className="border-2 border-y-[1px] border-sky-500 p-1">
      <section className="flex items-center">
        <Image
          src={data?.author.image as string}
          alt={""}
          width={69}
          height={69}
          className="mr-2 rounded-full"
          onClick={() => {
            router.push("/[user]", `/${data?.author.name}`);
          }}
        />
        <div>
          <div className="flex">
            <Link href={`/${data.author.name}`}>
              <h4 className="font-bold">{data?.author.name} </h4>
            </Link>
            <p className="ml-1 text-gray-500">
              {" "}
              - {data?.createdAt?.toISOString()}
            </p>
          </div>
          <div className="break-all">{data?.text}</div>

          <div className="mt-4 flex items-center ">
            <AiFillHeart
              color={hasLiked ? "red" : "gray"}
              size="1.5rem"
              onClick={() => {
                if (hasLiked) {
                  sessionData
                    ? unLikeIt({
                        tweetId: data?.id as string,
                      })
                    : alert("not login");
                } else {
                  sessionData
                    ? likeIt({
                        tweetId: data?.id as string,
                      })
                    : alert("not login");
                }
              }}
            />

            <span className="text-sm text-gray-500">{data?._count.like}</span>
          </div>
        </div>
      </section>
    </div>
  );
};
