import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

function Modal({ open, onClose, title, description, children, footer, size = "md" }) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-forest-950/45 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/95 shadow-[0_40px_120px_-40px_rgba(5,46,36,0.6)] backdrop-blur-xl",
          sizes[size],
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-forest-900/[0.07] px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-extrabold tracking-[-0.03em] text-forest-950">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-[11px] leading-5 text-slate-500">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-forest-900/10 bg-white text-slate-500 transition-colors hover:bg-forest-50 hover:text-forest-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="thin-scrollbar flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="border-t border-forest-900/[0.07] bg-mist/60 px-5 py-3.5">{footer}</div>
        )}
      </div>
    </div>
  );
}

export default Modal;
