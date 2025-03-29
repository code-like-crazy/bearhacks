import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/auth";

import SignOutButton from "@/components/auth/SignOutButton";

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
    </main>
  );
};
export default Home;
