import { cn } from "../../utils/cn";

function GlassCard({ children, className = "", interactive = false, as: Tag = "div", ...props }) {
  return (
    <Tag
      className={cn(
        "glass glow-border relative rounded-3xl",
        interactive &&
          "transition-all duration-500 hover:-translate-y-1 hover:border-emerald-300/60 hover:shadow-lift",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export default GlassCard;
