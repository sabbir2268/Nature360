import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import SectionHeading from "../../../components/ui/SectionHeading";
import Button from "../../../components/ui/Button";
import { cn } from "../../../utils/cn";
import { carouselSlides } from "../data/landingData";
import CarouselVisual from "./CarouselVisuals";

function Carousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [manualPaused, setManualPaused] = useState(false);
  const touchStartX = useRef(null);
  const reduceMotion = useReducedMotion();
  const isPaused = hoverPaused || manualPaused || reduceMotion;
  const slide = carouselSlides[index];
  const slideCount = carouselSlides.length;

  const goTo = (nextIndex) => {
    setDirection(nextIndex > index ? 1 : -1);
    setIndex((nextIndex + slideCount) % slideCount);
  };

  const goNext = () => {
    setDirection(1);
    setIndex((current) => (current + 1) % slideCount);
  };

  const goPrev = () => {
    setDirection(-1);
    setIndex((current) => (current - 1 + slideCount) % slideCount);
  };

  useEffect(() => {
    if (isPaused) return undefined;
    const timer = window.setInterval(() => {
      setDirection(1);
      setIndex((current) => (current + 1) % slideCount);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [index, isPaused, slideCount]);

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 48) {
      if (delta > 0) goPrev();
      else goNext();
    }
    touchStartX.current = null;
  };

  const variants = {
    enter: (slideDirection) => ({
      opacity: 0,
      x: reduceMotion ? 0 : slideDirection > 0 ? 48 : -48,
    }),
    center: { opacity: 1, x: 0 },
    exit: (slideDirection) => ({
      opacity: 0,
      x: reduceMotion ? 0 : slideDirection > 0 ? -48 : 48,
    }),
  };

  return (
    <section id="preview" className="relative py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Platform preview"
          title={
            <>
              A closer look at how <span className="text-gradient">change happens.</span>
            </>
          }
          description="From a citizen's first observation to a verified resolution, EcoTrack keeps every step visible."
          className="mb-10 sm:mb-12"
        />

        <div
          className="relative overflow-hidden rounded-[2rem] border border-white/75 bg-gradient-to-br from-white/80 via-[#F3FAF4] to-emerald-50/80 p-4 shadow-[0_30px_90px_-45px_rgba(5,46,36,0.4)] backdrop-blur-xl sm:rounded-[2.5rem] sm:p-7 lg:p-9"
          onMouseEnter={() => setHoverPaused(true)}
          onMouseLeave={() => setHoverPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              goPrev();
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              goNext();
            }
          }}
          role="region"
          aria-roledescription="carousel"
          aria-label="EcoTrack platform preview"
          tabIndex={0}
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lime-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-emerald-300/15 blur-3xl" />
          <div className="dot-pattern pointer-events-none absolute inset-0 opacity-[0.22]" />

          <div className="relative min-h-[600px] sm:min-h-[540px] lg:min-h-[500px]">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={slide.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="grid items-center gap-9 lg:grid-cols-2 lg:gap-8"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${slideCount}: ${slide.title}`}
              >
                <div className="order-2 lg:order-1">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-600/15 bg-white/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-forest-700 shadow-sm">
                    <slide.icon className="h-3.5 w-3.5 text-emerald-600" />
                    {slide.eyebrow}
                  </span>

                  <h3 className="mt-5 max-w-lg font-display text-[1.85rem] font-extrabold leading-[1.08] tracking-[-0.045em] text-forest-950 sm:text-4xl lg:text-[2.55rem]">
                    {slide.title}
                  </h3>
                  <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600 sm:text-[15px]">
                    {slide.description}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {slide.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5 text-[13px] font-medium text-slate-600">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500/12 text-emerald-700">
                          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
                            <path d="M2.5 6.2 4.8 8.5 9.5 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <Button href="#features" variant="outline" size="sm" className="group">
                      Explore features
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Button>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      {String(index + 1).padStart(2, "0")} / {String(slideCount).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                <div className="order-1 lg:order-2">
                  <CarouselVisual type={slide.visual} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-forest-900/[0.08] pt-5">
            <div className="flex items-center gap-2" role="tablist" aria-label="Choose a preview slide">
              {carouselSlides.map((item, itemIndex) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={itemIndex === index}
                  aria-label={`Go to slide ${itemIndex + 1}: ${item.eyebrow}`}
                  onClick={() => goTo(itemIndex)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    itemIndex === index
                      ? "w-9 bg-gradient-to-r from-emerald-500 to-lime-400"
                      : "w-2 bg-forest-900/15 hover:bg-forest-900/30",
                  )}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setManualPaused((value) => !value)}
                aria-label={manualPaused ? "Resume autoplay" : "Pause autoplay"}
                className="grid h-9 w-9 place-items-center rounded-full border border-forest-900/10 bg-white/70 text-forest-800 transition-colors hover:bg-white"
              >
                {manualPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous slide"
                className="grid h-9 w-9 place-items-center rounded-full border border-forest-900/10 bg-white/70 text-forest-800 transition-colors hover:bg-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next slide"
                className="grid h-9 w-9 place-items-center rounded-full border border-forest-900/10 bg-white/70 text-forest-800 transition-colors hover:bg-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="sr-only" aria-live="polite">
            Slide {index + 1} of {slideCount}: {slide.title}
          </p>
        </div>
      </div>
    </section>
  );
}

export default Carousel;
