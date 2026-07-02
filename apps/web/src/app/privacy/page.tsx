'use client';

import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen bg-[#050505] font-sans text-slate-200">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 lg:px-12 pt-32 pb-24">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-amber-500" />
          </div>
          <h1 className="text-4xl font-extrabold text-white">Privacy Policy</h1>
        </div>

        <div className="prose prose-invert prose-slate max-w-none">
          <p className="text-slate-400">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Introduction</h2>
          <p className="text-slate-400 mb-6">
            Welcome to KennyKentola Multi-Company Ecosystem. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. The Data We Collect About You</h2>
          <p className="text-slate-400 mb-6">
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-6 text-slate-400 mb-6 space-y-2">
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
            <li><strong>Profile Data</strong> includes your username and password, requests made by you, your interests, preferences, feedback and survey responses.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">3. How We Use Your Personal Data</h2>
          <p className="text-slate-400 mb-6">
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-slate-400 mb-6 space-y-2">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Contact Details</h2>
          <p className="text-slate-400 mb-6">
            If you have any questions about this privacy policy or our privacy practices, please contact us at:
          </p>
          <ul className="list-none text-slate-400 mb-6 space-y-2">
            <li><strong>Email:</strong> peterkehindeademola@gmail.com</li>
            <li><strong>Phone:</strong> +2348163571677, +2349048082076</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
