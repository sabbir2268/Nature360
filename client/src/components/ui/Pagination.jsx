import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";

function Pagination({ pagination, onPageChange, className = "" }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total, limit } = pagination;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(total, page * limit);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-forest-900/[0.07] bg-white/60 px-4 py-3",
        className,
      )}
    >
      <p className="text-[10px] font-semibold text-slate-500">
        Showing {start}-{end} of {total}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="grid h-8 w-8 place-items-center rounded-lg border border-forest-900/10 bg-white text-slate-500 transition-colors hover:bg-forest-50 disabled:pointer-events-none disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="px-2 text-[11px] font-bold text-forest-950">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="grid h-8 w-8 place-items-center rounded-lg border border-forest-900/10 bg-white text-slate-500 transition-colors hover:bg-forest-50 disabled:pointer-events-none disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
