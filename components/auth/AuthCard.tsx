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
        "relative rounded-xl border border-gray-200 bg-white/75 p-6 shadow-lg backdrop-blur-lg md:p-8", // Added relative positioning
        className,
      )}
    >
      {/* Top-left corner */}
      <svg
        className="absolute top-0 left-0 h-8 w-8 text-gray-500" // Increased size and changed color
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2} // Increased stroke width
          d="M15 6H9a3 3 0 00-3 3v6"
        />
      </svg>
      {/* Top-right corner */}
      <svg
        className="absolute top-0 right-0 h-8 w-8 text-gray-500" // Increased size and changed color
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2} // Increased stroke width
          d="M9 6h6a3 3 0 013 3v6"
        />
      </svg>
      {/* Bottom-left corner */}
      <svg
        className="absolute bottom-0 left-0 h-8 w-8 text-gray-500" // Increased size and changed color
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2} // Increased stroke width
          d="M15 18H9a3 3 0 01-3-3v-6"
        />
      </svg>
      {/* Bottom-right corner */}
      <svg
        className="absolute right-0 bottom-0 h-8 w-8 text-gray-500" // Increased size and changed color
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2} // Increased stroke width
          d="M9 18h6a3 3 0 003-3v-6"
        />
      </svg>
      {children}
    </div>
  );
};
export default AuthCard;
