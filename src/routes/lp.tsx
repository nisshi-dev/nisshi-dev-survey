import { DemoVideosSection } from "../components/lp/demo-videos-section";
import { FeaturesSection } from "../components/lp/features-section";
import { FooterSection } from "../components/lp/footer-section";
import { HeroSection } from "../components/lp/hero-section";
import { useHealthCheck } from "../hooks/use-health-check";

export function LandingPage() {
  const health = useHealthCheck();

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden px-4 pt-8 pb-8 md:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          background:
            "radial-gradient(ellipse at top, var(--accent) 0%, transparent 55%)",
        }}
      />
      <HeroSection health={health} />
      <DemoVideosSection />
      <FeaturesSection />
      <FooterSection />
    </div>
  );
}
