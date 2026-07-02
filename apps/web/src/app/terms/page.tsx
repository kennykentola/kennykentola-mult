import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';

export const metadata = {
  title: 'Terms of Service | KennyKentola Digital',
  description: 'Terms of service and user agreement for KennyKentola Digital ecosystem.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 lg:px-12 pt-32 pb-24">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">
          Terms of Service
        </h1>
        <p className="text-slate-400 mb-12">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-12 text-slate-300 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using the services provided by KennyKentola Digital (including our academic portals, printing services, and solar infrastructure consulting), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not access our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Services</h2>
            <p className="mb-4">
              KennyKentola Digital provides a multi-faceted ecosystem encompassing:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Technical education and mentorship via the Academy.</li>
              <li>Academic research assistance and project development.</li>
              <li>Enterprise software development and solar infrastructure consulting.</li>
              <li>Printing and documentation services.</li>
            </ul>
            <p>
              We reserve the right to modify, suspend, or discontinue any part of our services at any time without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Conduct</h2>
            <p className="mb-4">
              You agree to use our services only for lawful purposes. You are prohibited from:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Submitting false or misleading information.</li>
              <li>Attempting to breach our security systems or APIs.</li>
              <li>Using our academic services to violate your university's academic integrity policies.</li>
              <li>Harassing or abusing our mentors, technicians, or staff.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Academic Integrity Disclaimer</h2>
            <p className="mb-4">
              Our academic guidance and project development services are strictly intended for research, reference, and educational purposes. We provide mentorship, code samples, and structural guidance to help you understand complex topics. You are solely responsible for ensuring that your use of our materials complies with your institution's academic honesty policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Payments and Refunds</h2>
            <p className="mb-4">
              All payments for courses, printing jobs, solar quotes, and software development must be completed via our designated payment gateways. Due to the digital and custom nature of our services, refunds are evaluated on a case-by-case basis and are generally not provided for completed work or accessed digital content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
            <p className="mb-4">
              All content on this website, including text, graphics, logos, and code (excluding open-source projects explicitly licensed otherwise), is the property of KennyKentola Digital. You may not reproduce, distribute, or create derivative works without our explicit written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Contact Information</h2>
            <p className="mb-4">
              For any questions regarding these Terms of Service, please contact us at:
            </p>
            <ul className="list-none space-y-2 font-medium">
              <li><a href="mailto:ademolapeter233@gmail.com" className="text-blue-400 hover:underline">ademolapeter233@gmail.com</a></li>
              <li><a href="mailto:peterkehindeademola@gmail.com" className="text-blue-400 hover:underline">peterkehindeademola@gmail.com</a></li>
              <li><a href="mailto:peterkehindeademola9@gmail.com" className="text-blue-400 hover:underline">peterkehindeademola9@gmail.com</a></li>
            </ul>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
