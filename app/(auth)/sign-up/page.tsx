import Link from "next/link";

import AuthCard from "@/components/auth/AuthCard";
import SignUpForm from "@/components/auth/SignUpForm";

const SignUpPage = () => {
  return (
    <AuthCard>
      <div className="mb-6 space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Start Your Journey Here
        </h1>
        <p className="text-sm text-gray-600">
          Create your AppName account and begin crafting dream trips with
          friends.
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
