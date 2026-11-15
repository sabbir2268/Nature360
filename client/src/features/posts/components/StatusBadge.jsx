import { cn } from "../../../utils/cn";

const statusStyles = {
  Reported: "border-amber-200/80 bg-amber-50 text-amber-700",
  "Under Review": "border-sky-200/80 bg-sky-50 text-sky-700",
  "In Progress": "border-indigo-200/80 bg-indigo-50 text-indigo-700",
  Resolved: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
};

const statusDots = {
  Reported: "bg-amber-500",
  "Under Review": "bg-sky-500",
  "In Progress": "bg-indigo-500",
  Resolved: "bg-emerald-500",
};

function StatusBadge({ status = "Reported", className = "" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold",
        statusStyles[status] ?? statusStyles.Reported,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", statusDots[status] ?? statusDots.Reported)} />
      {status}
    </span>
  );
}

export default StatusBadge;
