import Link from "next/link";

import AuthCard from "@/components/auth/AuthCard";
import SignInForm from "@/components/auth/SignInForm";

const SignInPage = () => {
  return (
    <AuthCard>
      <div className="mb-6 space-y-2 text-center">
        {/* TODO: Consider adding an icon here */}
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          Welcome Back!
        </h1>
        <p className="text-gray-700 max-md:text-sm">
          Sign in to plan your next adventure.
        </p>
      </div>
      <SignInForm />
      <p className="mt-6 text-center text-sm text-gray-600">
        {" "}
        {/* Changed text-white/70 to text-gray-600 */}
        Don't have an account?{" "}
        <Link
          href="/sign-up"
          className="text-primary font-medium hover:underline" // Kept primary color for link
        >
          Sign Up
        </Link>
      </p>
    </AuthCard>
  );
};
export default SignInPage;
