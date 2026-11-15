import Hero from "../../landing/components/Hero";
import Carousel from "../../landing/components/Carousel";
import Problems from "../../landing/components/Problems";
import HowItWorks from "../../landing/components/HowItWorks";
import BentoFeatures from "../../landing/components/BentoFeatures";
import AboutSection from "../../landing/components/AboutSection";
import CtaSection from "../../landing/components/CtaSection";

function Home() {
  return (
    <>
      <Hero />
      <Carousel />
      <Problems />
      <HowItWorks />
      <BentoFeatures />
      <AboutSection />
      <CtaSection />
    </>
  );
}

export default Home;
