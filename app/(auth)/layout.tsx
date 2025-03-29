import Image from "next/image";

type Props = {
  children: React.ReactNode;
};

const AuthLayout = (props: Props) => {
  return (
    <div className="relative min-h-svh overflow-auto">
      <div className="fixed inset-0">
        <Image
          fill
          src={"/auth-bg-2.webp"}
          alt="Background"
          className="pointer-events-none object-cover select-none"
          priority
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
      </div>
      <div className="relative z-10 flex h-full min-h-svh items-center justify-center p-4">
        {/* Auth Wrapper */}
        <div className="w-full max-w-md">{props.children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
