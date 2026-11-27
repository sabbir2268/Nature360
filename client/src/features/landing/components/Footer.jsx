import { Link } from "react-router-dom";
import { ArrowUpRight, Leaf, ShieldCheck } from "lucide-react";
import Logo from "../../../components/common/Logo";
import { footerColumns } from "../data/landingData";
import { useAuth } from "../../auth/hooks/useAuth";
import { PATHS } from "../../../utils/paths";

function Footer() {
  const { user } = useAuth();

  const columns = footerColumns.map((column) => {
    if (column.title !== "Account" || !user) return column;

    return {
      title: column.title,
      links: [{ label: "My Profile", to: PATHS.DASHBOARD }],
    };
  });

  return (
    <footer className="relative overflow-hidden bg-forest-950 text-white">
      <div className="grid-pattern-dark pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-lime-300/[0.07] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.35fr_0.75fr_0.75fr_0.65fr] lg:gap-8">
          <div>
            <Logo tone="dark" />
            <p className="mt-5 max-w-sm text-[13px] leading-7 text-white/55">
              A citizen-powered environmental monitoring and response platform. Report local
              problems, follow real-world action, and help build cleaner, safer communities.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-[9px] font-semibold text-white/55">
                <Leaf className="h-3 w-3 text-lime-300" />
                Citizen-powered
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-[9px] font-semibold text-white/55">
                <ShieldCheck className="h-3 w-3 text-emerald-300" />
                Transparent by design
              </span>
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-lime-200/80">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="group inline-flex items-center gap-1 text-[12px] font-medium text-white/55 transition-colors duration-300 hover:text-white"
                      >
                        {link.label}
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="group inline-flex items-center gap-1 text-[12px] font-medium text-white/55 transition-colors duration-300 hover:text-white"
                      >
                        {link.label}
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-[10px] font-medium text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Nature360. Environmental Monitoring &amp; Response Platform.</p>
          <p className="sm:text-right">
            Demo landing experience · Statistics shown are illustrative
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
