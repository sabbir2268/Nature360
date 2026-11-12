import { Outlet } from "react-router-dom";
import Navbar from "../../features/landing/components/Navbar";
import Footer from "../../features/landing/components/Footer";

function LandingLayout() {
  return (
    <div className="min-h-screen overflow-x-clip bg-mist text-ink">
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-forest-950 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default LandingLayout;
