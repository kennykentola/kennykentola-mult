import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';

import { HeroBanner, TrustMetrics } from '../../components/solar/HeroSection';
import { ServicesSection } from '../../components/solar/ServicesSection';
import { WhyChooseUs } from '../../components/solar/WhyChooseUs';
import { FeaturedProjects } from '../../components/solar/FeaturedProjects';
import { OurProcess } from '../../components/solar/OurProcess';
import { SmartEnergy } from '../../components/solar/SmartEnergy';
import { MaintenancePlans } from '../../components/solar/MaintenancePlans';
import { Testimonials } from '../../components/solar/Testimonials';
import { FAQ } from '../../components/solar/FAQ';
import { MultiStepForm } from '../../components/solar/MultiStepForm';
import { FinalCTA } from '../../components/solar/FinalCTA';

export const metadata = {
  title: 'Infinite Power Infrastructure | Enterprise Solar',
  description: 'Relentless Energy. Zero Downtime. Engineer-grade solar and electrical infrastructure for physical operations.',
};

export default function SolarLandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Navbar />

      <main>
        {/* Section 1 & 2 */}
        <HeroBanner />
        <TrustMetrics />

        {/* Section 3 */}
        <ServicesSection />

        {/* Section 4 */}
        <WhyChooseUs />

        {/* Section 5 */}
        <FeaturedProjects />

        {/* Section 6 */}
        <OurProcess />

        {/* Section 7 */}
        <SmartEnergy />

        {/* Section 8 */}
        <MaintenancePlans />

        {/* Section 9 */}
        <Testimonials />

        {/* Section 10 */}
        <FAQ />

        {/* Section 11 */}
        <MultiStepForm />

        {/* Section 12 */}
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
