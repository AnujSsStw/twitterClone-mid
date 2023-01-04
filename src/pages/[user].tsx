import { useRouter } from "next/router";
import { Container } from "../components/container";
import { TimeLine } from "../components/timeLine";
import { trpc } from "../utils/trpc";

const User = () => {
  const router = useRouter();
  const id = router.query.user as string;

  return (
    <>
      <Container>
        <TimeLine filterId={id} />
      </Container>
    </>
  );
};

export default User;
