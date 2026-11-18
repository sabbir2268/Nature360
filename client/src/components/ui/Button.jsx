import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

const variants = {
  primary:
    "bg-gradient-to-r from-forest-900 via-forest-800 to-emerald-700 text-white shadow-lg shadow-emerald-950/20 hover:shadow-emerald-900/30 hover:brightness-110",
  lime:
    "bg-lime-300 text-forest-950 shadow-lg shadow-lime-400/20 hover:bg-lime-200 hover:shadow-lime-300/30",
  outline:
    "border border-forest-900/15 bg-white/70 text-forest-900 shadow-sm backdrop-blur hover:border-emerald-500/40 hover:bg-white",
  ghost: "text-forest-900 hover:bg-forest-900/[0.06]",
  darkOutline:
    "border border-white/20 bg-white/[0.08] text-white backdrop-blur hover:border-white/35 hover:bg-white/[0.14]",
  white: "bg-white text-forest-950 shadow-lg shadow-forest-950/15 hover:bg-forest-50",
};

const sizes = {
  xs: "h-7 px-2.5 text-[10px]",
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px] sm:h-[52px] sm:px-7",
};

function buttonClasses({ variant = "primary", size = "md", className = "" }) {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold tracking-[-0.01em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
    variants[variant],
    sizes[size],
    className,
  );
}

function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  to,
  href,
  type = "button",
  ...props
}) {
  if (to) {
    return (
      <Link to={to} className={buttonClasses({ variant, size, className })} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={buttonClasses({ variant, size, className })} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={buttonClasses({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}

export default Button;
