type WelcomeBannerProps = {
  userName?: string | null;
};

export function WelcomeBanner({ userName }: WelcomeBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border-b bg-gradient-to-r from-white to-gray-50 p-8 shadow-sm">
      {/* Decorative wave pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-5">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 100 C 150 150, 250 50, 400 100 L 400 400 L 0 400"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Decorative emojis */}
      <div className="absolute top-8 right-8 text-lg opacity-20">🌴✈️🏛️</div>

      <div className="relative">
        <h1 className="text-3xl font-bold text-slate-800">
          Plan your next adventure,{" "}
          <span className="whitespace-nowrap">
            {userName || "Explorer"}! 🎒
          </span>
        </h1>
        <p className="mt-2 text-gray-600">
          Ready to map out your dream trip? Create a board to get started.
        </p>
      </div>
    </div>
  );
}
