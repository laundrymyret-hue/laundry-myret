import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/myret/Navbar";
import { Hero } from "@/components/myret/Hero";
import { TrustBar } from "@/components/myret/TrustBar";
import { Services } from "@/components/myret/Services";
import { ServiceCatalog } from "@/components/myret/ServiceCatalog";
import { HowItWorks } from "@/components/myret/HowItWorks";
import { LiveTracking } from "@/components/myret/LiveTracking";
import { AppShowcase } from "@/components/myret/AppShowcase";
import { WhyMyret } from "@/components/myret/WhyMyret";
import { Subscriptions } from "@/components/myret/Subscriptions";
import { Testimonials } from "@/components/myret/Testimonials";
import { BeforeAfter } from "@/components/myret/BeforeAfter";
import { Business } from "@/components/myret/Business";
import { Rewards } from "@/components/myret/Rewards";
import { FaqSection } from "@/components/myret/FaqSection";
import { FinalCta } from "@/components/myret/FinalCta";
import { SiteFooter } from "@/components/myret/SiteFooter";

const ldJson = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "MyRet Laundry",
  description:
    "Premium dry cleaning, wash & fold, garment care and pickup & delivery service.",
  slogan: "Luxury Garment Care. Delivered.",
  priceRange: "$$",
  areaServed: "City-wide",
  makesOffer: [
    "Dry Cleaning",
    "Wash & Fold",
    "Ironing & Pressing",
    "Pickup & Delivery",
    "Express Service",
  ],
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MyRet Laundry — Luxury Garment Care. Delivered." },
      {
        name: "description",
        content:
          "Premium dry cleaning, wash & fold, expert garment care, and seamless pickup & delivery across the city. Schedule your first pickup with MyRet Laundry.",
      },
      { property: "og:title", content: "MyRet Laundry — Luxury Garment Care. Delivered." },
      {
        property: "og:description",
        content:
          "Premium cleaning, expert garment care, and seamless pickup & delivery. Laundry reimagined.",
      },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(ldJson) }],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="overflow-x-hidden bg-background">
      <Navbar />
      <Hero />
      <TrustBar />
      <Services />
      <ServiceCatalog />
      <HowItWorks />
      <LiveTracking />
      <AppShowcase />
      <WhyMyret />
      <Subscriptions />
      <Testimonials />
      <BeforeAfter />
      <Business />
      <Rewards />
      <FaqSection />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}
