import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';

export const metadata = {
  title: 'Disclaimer — KennyKentola',
};

export default function DisclaimerPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white font-sans">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 pt-24 pb-24">
        <h1 className="text-4xl font-bold mb-8">Disclaimer</h1>
        <div className="prose prose-invert max-w-none text-slate-300 space-y-6">
          <p>
            The information provided by KennyKentola ("we," "us," or "our") on our website, mobile applications, and within our courses or services is for general informational and educational purposes only. All information is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.
          </p>
          
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Educational and Career Outcomes</h2>
          <p>
            KennyKentola Academy provides software development training and bootcamps. While we equip students with industry-standard skills and offer career guidance, we do not guarantee employment, internships, or specific salary outcomes upon completion of our programs. Student success depends on individual effort, market conditions, and external factors beyond our control.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Academic Guidance</h2>
          <p>
            Our academic and research guidance services are intended to support, assist, and provide templates for students and researchers. We do not engage in academic dishonesty, plagiarism, or writing theses on behalf of students. Users are solely responsible for ensuring their submissions comply with their respective institution's academic integrity policies.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Professional Services</h2>
          <p>
            Our custom software, solar installation, and graphic design services are executed based on the requirements provided by the client. We cannot be held liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the products or services we deliver. Warranty terms for physical installations (like Solar) are strictly limited to what is explicitly stated in the formal Service Agreement.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. External Links</h2>
          <p>
            Our website may contain links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Updates</h2>
          <p>
            We reserve the right to amend this disclaimer at any time without notice. By using our website and services, you hereby consent to our disclaimer and agree to its terms.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
