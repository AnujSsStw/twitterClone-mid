import { useSession } from "next-auth/react";
import { ChangeEvent, FC, FormEvent, useState } from "react";
import { object, string, z } from "zod";
import { trpc } from "../utils/trpc";

export const TweetTextType = object({
  text: z
    .string({
      required_error: "fucking type something",
    })
    .min(1)
    .max(280),
});

export const TweetForm: FC = () => {
  const [text, setText] = useState<string>("");
  const [error, setError] = useState("");
  const util = trpc.useContext();

  const { data: sessionData } = useSession();

  const { mutateAsync } = trpc.tweet.createTweet.useMutation({
    onSuccess: () => {
      setText("");
      util.tweet.getAllTweet.invalidate();
    },
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sessionData) {
      try {
        TweetTextType.parse({ text });
        setError("");
      } catch (error: any) {
        setError("Format error");

        return;
      }

      mutateAsync({
        text,
      });
    } else {
      setError("Not Login");
    }
  }

  return (
    <>
      <div className="mx-auto max-w-2xl pb-5">
        <form onSubmit={handleSubmit} className="flex  flex-col">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-10 mb-3 border-2 border-green-400"
          />
          <div>{error}</div>
          <button
            type="submit"
            className="mx-auto w-max rounded-md bg-blue-500 px-4 py-2"
          >
            Tweet
          </button>
        </form>
      </div>
    </>
  );
};
