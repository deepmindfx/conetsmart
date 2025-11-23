import React from 'react';
import { ArrowLeft } from 'lucide-react';

export const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="mb-8">
          <a href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#f27e31] transition-colors mb-6">
            <ArrowLeft size={20} />
            Back to Home
          </a>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-orange max-w-none text-gray-600">
          <p className="mb-6">
            Welcome to ConetSmart. By accessing or using our website, mobile application, or internet services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Our Services</h2>
          <p className="mb-4">
            ConetSmart provides high-speed wireless internet access through various subscription plans (hourly, daily, weekly, monthly). We also offer a digital wallet system and virtual bank accounts to facilitate easy payments and top-ups.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. User Accounts</h2>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>You must create an account to access our services. You agree to provide accurate, current, and complete information during the registration process.</li>
            <li>You are responsible for safeguarding your password and for all activities that occur under your account.</li>
            <li>You must notify us immediately of any unauthorized use of your account.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Payments and Wallet</h2>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li><strong>Wallet Funding:</strong> You can fund your ConetSmart wallet via bank transfer to your dedicated virtual account or other supported payment methods.</li>
            <li><strong>Virtual Accounts:</strong> To create a virtual account, you must provide a valid Bank Verification Number (BVN) as required by Central Bank of Nigeria (CBN) regulations.</li>
            <li><strong>No Refunds:</strong> All purchases of internet plans are final and non-refundable once the service has been activated or credentials generated.</li>
            <li><strong>Transfers:</strong> You are responsible for verifying the recipient information before transferring funds to another user. ConetSmart is not liable for funds sent to the wrong user due to your error.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Acceptable Use Policy</h2>
          <p className="mb-4">You agree not to use our services to:</p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>Engage in any illegal activities or violate any laws.</li>
            <li>Distribute malware, viruses, or harmful code.</li>
            <li>Attempt to gain unauthorized access to our network or other users' accounts.</li>
            <li>Resell our services without express written permission.</li>
            <li>Engage in high-bandwidth activities that significantly degrade the network performance for other users (fair usage policy applies).</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Service Availability</h2>
          <p className="mb-6">
            We strive to provide uninterrupted service, but we do not guarantee that our services will be available at all times. Service may be interrupted for maintenance, upgrades, or due to technical issues beyond our control. We are not liable for any loss or damage arising from service interruptions.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. Termination</h2>
          <p className="mb-6">
            We reserve the right to suspend or terminate your account and access to our services immediately, without prior notice or liability, for any reason, including but not limited to a breach of these Terms.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">7. Changes to Terms</h2>
          <p className="mb-6">
            We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">8. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at:
          </p>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <p className="font-semibold text-gray-900">ConetSmart</p>
            <p>Behind Sabon Layi Round About</p>
            <p>Phone: 08033707947, 08036506511</p>
          </div>
        </div>
      </div>
    </div>
  );
};

