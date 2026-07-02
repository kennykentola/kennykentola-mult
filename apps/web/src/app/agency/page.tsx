import React from 'react';
import { AgencyNavbar } from '../../components/agency/AgencyNavbar';
import { AgencyHero } from '../../components/agency/AgencyHero';
import { TrustedBy } from '../../components/agency/TrustedBy';
import { ServicesOverview } from '../../components/agency/ServicesOverview';
import { WhyChooseUs } from '../../components/agency/WhyChooseUs';
import { DevelopmentProcess } from '../../components/agency/DevelopmentProcess';
import { PortfolioPreview } from '../../components/agency/PortfolioPreview';
import { CaseStudies } from '../../components/agency/CaseStudies';
import { Technologies } from '../../components/agency/Technologies';
import { PricingPreview } from '../../components/agency/PricingPreview';
import { Testimonials } from '../../components/agency/Testimonials';
import { FAQs } from '../../components/agency/FAQs';
import { BlogPreview } from '../../components/agency/BlogPreview';
import { CTASection } from '../../components/agency/CTASection';
import { AgencyFooter } from '../../components/agency/AgencyFooter';

export const metadata = {
  title: 'KennyKentola Software Agency | Award-Winning Development',
  description: 'We engineer scalable enterprise software, mobile applications, and high-conversion SaaS platforms.',
};

export default function AgencyLandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] font-sans text-slate-200">
      <AgencyNavbar />
      
      <main>
        <AgencyHero />
        <TrustedBy />
        <ServicesOverview />
        <WhyChooseUs />
        <DevelopmentProcess />
        <PortfolioPreview />
        <CaseStudies />
        <Technologies />
        <PricingPreview />
        <Testimonials />
        <FAQs />
        <BlogPreview />
        <CTASection />
      </main>

      <AgencyFooter />
    </div>
  );
}
