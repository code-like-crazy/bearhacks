import Link from "next/link";

import AuthCard from "@/components/auth/AuthCard";
import SignUpForm from "@/components/auth/SignUpForm";

const SignUpPage = () => {
  return (
    <AuthCard>
      <div className="mb-6 space-y-3 text-center">
        {" "}
        {/* Increased space */}
        {/* TODO: Consider adding an icon here */}
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {" "}
          {/* Bolder, larger */}
          Join the Adventure!
        </h1>
        <p className="text-md text-gray-700">
          {" "}
          {/* Slightly larger, darker gray */}
          Create an account to start collaborating on trips.
        </p>
      </div>
      <SignUpForm />
      <p className="mt-6 text-center text-sm text-gray-600">
        {" "}
        {/* Changed text-white/70 to text-gray-600 */}
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-primary font-medium hover:underline" // Kept primary color for link
        >
          Sign In
        </Link>
      </p>
    </AuthCard>
  );
};
export default SignUpPage;
