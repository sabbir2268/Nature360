import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";
import { cn } from "../../utils/cn";

function Logo({ to = "/", tone = "light", className = "", showWordmark = true }) {
  const isDark = tone === "dark";

  return (
    <Link
      to={to}
      aria-label="EcoTrack home"
      className={cn("group inline-flex items-center gap-2.5 rounded-xl", className)}
    >
      <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-forest-900 via-emerald-600 to-lime-400 shadow-lg shadow-emerald-900/20 ring-1 ring-inset ring-white/30 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
        <Leaf className="relative z-10 h-5 w-5 text-white" strokeWidth={2.4} />
        <span className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white/20 blur-md" />
      </span>
      {showWordmark && (
        <span
          className={cn(
            "font-display text-xl font-extrabold tracking-[-0.03em]",
            isDark ? "text-white" : "text-forest-950",
          )}
        >
          Eco<span className={isDark ? "text-lime-300" : "text-emerald-600"}>Track</span>
        </span>
      )}
    </Link>
  );
}

export default Logo;
