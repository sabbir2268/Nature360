import { cn } from "../../utils/cn";

function SelectField({ id, label, icon: Icon, options = [], className = "", hint, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[11px] font-bold text-forest-900">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
        <select
          id={id}
          className={cn(
            "h-12 w-full appearance-none rounded-xl border border-forest-900/10 bg-white/80 px-4 text-sm font-medium text-forest-950 outline-none transition-all duration-300 focus:border-emerald-400/70 focus:bg-white focus:ring-4 focus:ring-emerald-500/10",
            Icon && "pl-10",
            "pr-10",
            className,
          )}
          {...props}
        >
          {options.map((option) => {
            const value = typeof option === "string" ? option : option.value;
            const text = typeof option === "string" ? option : option.label;
            return (
              <option key={value} value={value}>
                {text}
              </option>
            );
          })}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        >
          <path
            d="M5.5 8l4.5 4.5L14.5 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {hint && <p className="mt-1.5 text-[10px] leading-5 text-slate-400">{hint}</p>}
    </div>
  );
}

export default SelectField;
