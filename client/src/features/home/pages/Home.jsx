import Hero from "../../landing/components/Hero";
import Carousel from "../../landing/components/Carousel";
import Awareness from "../../landing/components/Awareness";
import Problems from "../../landing/components/Problems";
import HowItWorks from "../../landing/components/HowItWorks";
import BentoFeatures from "../../landing/components/BentoFeatures";
import DashboardPreview from "../../landing/components/DashboardPreview";
import AboutSection from "../../landing/components/AboutSection";
import CtaSection from "../../landing/components/CtaSection";

function Home() {
  return (
    <>
      <Hero />
      <Carousel />
      <Awareness />
      <Problems />
      <HowItWorks />
      <BentoFeatures />
      <DashboardPreview />
      <AboutSection />
      <CtaSection />
    </>
  );
}

export default Home;
