import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';

export const metadata = {
  title: 'Refund Policy — KennyKentola',
};

export default function RefundPolicyPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 pt-24 pb-24">
        <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
        <div className="prose prose-invert max-w-none text-slate-300 space-y-6">
          <p>
            At KennyKentola, we strive to ensure our customers and students are completely satisfied with our services and courses. This Refund Policy outlines the conditions under which refunds may be granted.
          </p>
          
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Academy Courses & Bootcamps</h2>
          <p>
            We offer a 7-day money-back guarantee for our self-paced courses, provided you have not completed more than 20% of the curriculum. For bootcamps and cohort-based learning, refunds are only processed if requested at least 7 days before the cohort begins. Once a bootcamp has commenced, we do not offer refunds.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Custom Software & Development</h2>
          <p>
            For custom software agency work, initial deposits are non-refundable as they cover the immediate mobilization of our resources, planning, and design. Refund terms for subsequent milestones will be clearly outlined in your specific Service Level Agreement (SLA).
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Printing & Graphic Design</h2>
          <p>
            Due to the custom nature of printing and design, we do not offer refunds once production has begun. If there is a verified defect or error on our part, we will gladly reprint the materials at no additional cost. Design fees are non-refundable once the initial design concepts have been shared.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Solar Installations</h2>
          <p>
            Deposits for solar equipment procurement are strictly non-refundable. Service and installation warranties are covered under our separate Maintenance Agreement, which guarantees free repairs or replacements for specific components within the warranty period.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. How to Request a Refund</h2>
          <p>
            To request a refund, please contact us at <a href="mailto:peterkehindeademola9@gmail.com" className="text-indigo-400 hover:text-indigo-300">peterkehindeademola9@gmail.com</a> with your receipt, order number, and reason for the request. We aim to process all valid requests within 5-7 business days.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
