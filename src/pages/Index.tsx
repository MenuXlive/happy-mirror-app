import { TrustBanner } from "@/components/marketing/TrustBanner";
import { Hero } from "@/components/marketing/Hero";
import { BenefitsGrid } from "@/components/marketing/BenefitsGrid";
import { Steps } from "@/components/marketing/Steps";
import { Pricing } from "@/components/marketing/Pricing";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-center">
          <TrustBanner />
        </div>
        <Hero />
        <BenefitsGrid />
        <Steps />
        <Pricing />
      </div>
    </div>
  );
};

export default Index;
