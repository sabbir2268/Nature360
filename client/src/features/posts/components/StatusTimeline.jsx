import { Check } from "lucide-react";
import { POST_STATUSES } from "../services/postServices";
import { cn } from "../../../utils/cn";

const descriptions = {
  Submitted: "Complaint received with your details and evidence.",
  "Under Review": "An officer is checking the report details.",
  Verified: "The issue was verified at the reported location.",
  Investigation: "The responsible team is investigating the cause.",
  "Action Taken": "Corrective action is being carried out.",
  Resolved: "The issue has been fixed and the complaint closed.",
};

function StatusTimeline({ status = "Submitted" }) {
  const currentIndex = Math.max(POST_STATUSES.indexOf(status), 0);

  return (
    <ol className="mt-4 space-y-0">
      {POST_STATUSES.map((step, index) => {
        const isComplete = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={step} className="relative flex gap-3 pb-4 last:pb-0">
            {index < POST_STATUSES.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-[11px] top-6 h-full w-px",
                  index < currentIndex ? "bg-emerald-400/60" : "bg-forest-900/10",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] font-bold transition-colors",
                isComplete
                  ? "border-emerald-500/30 bg-gradient-to-br from-emerald-600 to-forest-800 text-lime-200"
                  : "border-forest-900/10 bg-white text-slate-400",
              )}
            >
              {isComplete ? <Check className="h-3 w-3" /> : index + 1}
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-[11px] font-bold",
                  isCurrent ? "text-forest-950" : isComplete ? "text-forest-800" : "text-slate-400",
                )}
              >
                {step}
                {isCurrent && (
                  <span className="ml-2 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-emerald-700">
                    Current
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-[10px] leading-5 text-slate-400">{descriptions[step]}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default StatusTimeline;
