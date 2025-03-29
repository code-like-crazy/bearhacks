import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/auth";

import SignOutButton from "@/components/auth/SignOutButton";
import CreateBoardModal from "@/components/modals/CreateBoardModal";
import ShareBoardModal from "@/components/modals/ShareBoardModal";

const Home = async () => {
  const user = await getCurrentUser();

  return (
    <main>
      Landing Page
      {user ? (
        <div>
          <p>Welcome, {user.name}</p>
          <Image width={400} height={400} src={user.imageUrl} alt="Avatar" />
          <SignOutButton />
        </div>
      ) : (
        <div>
          <p>You're not logged in</p>
          <Link href="/sign-in">Sign In</Link>
        </div>
      )}
      <ShareBoardModal
        board={{
          createdAt: 1690873200000,
          id: "1234567890",
          imageUrl: "/avatars/bee.jpg",
          inviteCode: "123456",
          name: "Bebiboard",
          lockedAt: 0,
          creatorId: "1234567890",
        }}
      />
      <CreateBoardModal />
    </main>
  );
};
export default Home;
