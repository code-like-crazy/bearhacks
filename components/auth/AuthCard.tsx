import { cn } from "@/lib/utils";

const AuthCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white/75 p-6 shadow-lg backdrop-blur-lg md:p-8", // Changed to white background, standard border, shadow
        className,
      )}
    >
      {children}
    </div>
  );
};
export default AuthCard;
