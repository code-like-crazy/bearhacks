import Image from "next/image";
import { getCurrentUser } from "@/auth";

const Home = async () => {
  const user = await getCurrentUser();

  return (
    <main>
      Landing Page
      <Image
        width={400}
        height={400}
        src={user?.imageUrl ?? "/avatar.png"}
        alt="Avatar"
      />
    </main>
  );
};
export default Home;
