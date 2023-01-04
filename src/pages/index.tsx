import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { Container } from "../components/container";
import { TimeLine } from "../components/timeLine";
import { TweetForm } from "../components/tweetForm";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  return (
    <>
      <AuthShowcase />

      <TweetForm />
      <Container>
        <TimeLine />
      </Container>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="sticky top-0  z-50  flex items-center justify-center gap-4 bg-teal-500 p-1">
      <p className="text-center text-2xl text-black">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-black no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => signOut() : () => signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
