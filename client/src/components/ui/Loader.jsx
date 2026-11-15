import { cn } from "../../utils/cn";

export const Loader = ({ label = "Loading", className = "" }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <span className="relative grid h-10 w-10 place-items-center">
        <span className="absolute inset-0 rounded-full border-2 border-forest-900/10" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-emerald-500 border-r-lime-400" />
        <span className="h-2 w-2 rounded-full bg-forest-900" />
      </span>
      <span className="sr-only">{label}</span>
    </div>
  );
};
