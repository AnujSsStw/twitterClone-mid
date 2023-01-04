import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { RouterInputs, RouterOutputs } from "./trpc";

export const updateCache = ({
  action,
  client,
  data,
  inputs,
  variables,
}: props) => {
  client.setQueryData(
    [
      ["tweet", "getAllTweet"],
      {
        input: {
          limit: 10,
          filterId: inputs,
        },
        type: "infinite",
      },
    ],
    (oldData: any) => {
      const newData = oldData as InfiniteData<
        RouterOutputs["tweet"]["getAllTweet"]
      >;

      const modified = newData.pages.map((page) => {
        return {
          data: page.data.map((tweet) => {
            if (variables.tweetId === tweet.id) {
              return {
                ...tweet,
                like: action === "like" ? [data.userId] : [],
                _count:
                  action === "like"
                    ? { like: tweet._count.like + 1 }
                    : { like: tweet._count.like - 1 },
              };
            }
            return tweet;
          }),
        };
      });

      return { ...oldData, pages: modified };
    }
  );
};

interface props {
  client: QueryClient;
  inputs: RouterInputs["tweet"]["getAllTweet"]["filterId"];
  variables: {
    tweetId: string;
  };
  data: {
    userId: string;
  };
  action: "like" | "unlike";
}
