import Link from "next/link";

import AuthCard from "@/components/auth/AuthCard";
import SignInForm from "@/components/auth/SignInForm";

const SignInPage = () => {
  return (
    <AuthCard>
      <div className="mb-6 space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Ready for Your Next Trip?
        </h1>
        <p className="text-sm text-gray-600">
          Sign in to access your collaborative travel boards and AI insights.
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
