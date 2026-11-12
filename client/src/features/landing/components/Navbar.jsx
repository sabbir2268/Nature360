import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, LogIn, Menu, X } from "lucide-react";
import Logo from "../../../components/common/Logo";
import Button from "../../../components/ui/Button";
import { navLinks } from "../data/landingData";
import { cn } from "../../../utils/cn";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Primary navigation"
        className={cn(
          "relative mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-2xl border px-4 py-3 transition-all duration-500 sm:px-5",
          scrolled
            ? "border-white/75 bg-white/80 shadow-[0_18px_50px_-24px_rgba(5,46,36,0.32)] backdrop-blur-2xl"
            : "border-white/55 bg-white/55 shadow-[0_12px_40px_-30px_rgba(5,46,36,0.25)] backdrop-blur-xl",
        )}
      >
        <Logo />

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative rounded-full px-3.5 py-2 text-[13px] font-semibold text-slate-600 transition-colors duration-300 hover:text-forest-950"
            >
              {link.label}
              <span className="absolute inset-x-3.5 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-emerald-500 to-lime-400 transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Button to="/login" variant="ghost" size="sm" className="gap-1.5">
            <LogIn className="h-3.5 w-3.5" />
            Login
          </Button>
          <Button to="/register" size="sm" className="gap-1.5">
            Get Started
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-xl border border-forest-900/10 bg-white/70 text-forest-900 transition-colors hover:bg-white lg:hidden"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              id="mobile-navigation"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-[calc(100%+0.6rem)] overflow-hidden rounded-2xl border border-white/75 bg-white/90 p-3 shadow-[0_24px_70px_-24px_rgba(5,46,36,0.4)] backdrop-blur-2xl lg:hidden"
            >
              <div className="flex flex-col">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeMobile}
                    className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-forest-50 hover:text-forest-950"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-forest-900/10 pt-3">
                <Button to="/login" variant="outline" size="sm" onClick={closeMobile}>
                  Login
                </Button>
                <Button to="/register" size="sm" onClick={closeMobile}>
                  Get Started
                </Button>
              </div>
              <p className="mt-3 px-2 text-[11px] leading-relaxed text-slate-500">
                Demo landing experience. Statistics shown are illustrative.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

export default Navbar;
