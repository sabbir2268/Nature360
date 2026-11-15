import { cn } from "../../../utils/cn";

const statusStyles = {
  Submitted: "border-slate-200/80 bg-slate-50 text-slate-700",
  "Under Review": "border-amber-200/80 bg-amber-50 text-amber-700",
  Verified: "border-sky-200/80 bg-sky-50 text-sky-700",
  Investigation: "border-indigo-200/80 bg-indigo-50 text-indigo-700",
  "Action Taken": "border-violet-200/80 bg-violet-50 text-violet-700",
  Resolved: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
};

const statusDots = {
  Submitted: "bg-slate-400",
  "Under Review": "bg-amber-500",
  Verified: "bg-sky-500",
  Investigation: "bg-indigo-500",
  "Action Taken": "bg-violet-500",
  Resolved: "bg-emerald-500",
};

function StatusBadge({ status = "Submitted", className = "" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold",
        statusStyles[status] ?? statusStyles.Submitted,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", statusDots[status] ?? statusDots.Submitted)} />
      {status}
    </span>
  );
}

export default StatusBadge;
