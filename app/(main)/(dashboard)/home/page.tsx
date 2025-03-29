import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";

const HomePage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <div>HomePage</div>;
};
export default HomePage;
