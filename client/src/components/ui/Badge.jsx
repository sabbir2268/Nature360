import { cn } from "../../utils/cn";

const riskStyles = {
  Low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Moderate: "border-amber-200 bg-amber-50 text-amber-700",
  High: "border-orange-200 bg-orange-50 text-orange-700",
  Critical: "border-rose-200 bg-rose-50 text-rose-700",
};

const priorityStyles = {
  Low: "border-slate-200 bg-slate-50 text-slate-600",
  Medium: "border-sky-200 bg-sky-50 text-sky-700",
  High: "border-amber-200 bg-amber-50 text-amber-700",
  Urgent: "border-rose-200 bg-rose-50 text-rose-700",
};

const roleStyles = {
  Citizen: "border-slate-200 bg-slate-50 text-slate-700",
  Officer: "border-indigo-200 bg-indigo-50 text-indigo-700",
  Volunteer: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Admin: "border-violet-200 bg-violet-50 text-violet-700",
};

const verificationStyles = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Verified: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

function Badge({ children, className = "", dot = true }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold",
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

export function RiskBadge({ level = "Low", className = "" }) {
  return (
    <Badge className={cn(riskStyles[level] || riskStyles.Low, className)}>{level} risk</Badge>
  );
}

export function PriorityBadge({ priority = "Medium", className = "" }) {
  return (
    <Badge className={cn(priorityStyles[priority] || priorityStyles.Medium, className)}>
      {priority} priority
    </Badge>
  );
}

export function RoleBadge({ role = "Citizen", className = "" }) {
  return <Badge className={cn(roleStyles[role] || roleStyles.Citizen, className)}>{role}</Badge>;
}

export function VerificationBadge({ status = "Pending", className = "" }) {
  return (
    <Badge className={cn(verificationStyles[status] || verificationStyles.Pending, className)}>
      {status}
    </Badge>
  );
}

export default Badge;
