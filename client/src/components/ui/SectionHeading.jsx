import { cn } from "../../utils/cn";
import Reveal from "./Reveal";

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "light",
  className = "",
  titleClassName = "",
}) {
  const isDark = tone === "dark";
  const isLeft = align === "left";

  return (
    <Reveal
      className={cn(
        "max-w-3xl",
        isLeft ? "text-left" : "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "mb-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]",
            isDark
              ? "border-white/15 bg-white/[0.07] text-lime-200"
              : "border-forest-900/10 bg-white/75 text-forest-700 shadow-sm backdrop-blur",
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", isDark ? "bg-lime-300" : "bg-emerald-500")} />
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "font-display text-[2rem] font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-4xl lg:text-[2.8rem]",
          isDark ? "text-white" : "text-forest-950",
          titleClassName,
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-5 text-[15px] leading-7 sm:text-base",
            isLeft ? "max-w-2xl" : "mx-auto max-w-2xl",
            isDark ? "text-white/65" : "text-slate-600",
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}

export default SectionHeading;
