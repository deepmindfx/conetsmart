import React from 'react';
import { ArrowLeft } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="mb-8">
          <a href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#f27e31] transition-colors mb-6">
            <ArrowLeft size={20} />
            Back to Home
          </a>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-orange max-w-none text-gray-600">
          <p className="mb-6">
            At ConetSmart, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our mobile application, or use our internet services.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">We collect information that you provide directly to us when you register, make a purchase, or contact us.</p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li><strong>Personal Information:</strong> Name, email address, phone number, and password.</li>
            <li><strong>Verification Information:</strong> Bank Verification Number (BVN) is required by CBN regulations to create virtual accounts for wallet funding. We do not store your BVN directly; it is verified securely through our payment partners.</li>
            <li><strong>Payment Information:</strong> Transaction history and wallet balance. Actual payment card details are processed by our secure payment processor (Flutterwave) and are not stored on our servers.</li>
            <li><strong>Usage Data:</strong> Information about your internet usage, data consumption, and login times to manage your plan.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>Provide, operate, and maintain our internet services.</li>
            <li>Process your transactions and manage your wallet balance.</li>
            <li>Create and manage your virtual bank account for funding.</li>
            <li>Send you notifications about your plan status, payments, and updates.</li>
            <li>Detect and prevent fraudulent usage and network abuse.</li>
            <li>Comply with legal and regulatory obligations.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Disclosure of Your Information</h2>
          <p className="mb-4">We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
            <li><strong>Third-Party Service Providers:</strong> We may share information with third parties that perform services for us or on our behalf, such as payment processing (Flutterwave), data analysis, and email delivery.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Security of Your Information</h2>
          <p className="mb-6">
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Your Data Rights</h2>
          <p className="mb-6">
            You have the right to request access to the personal information we hold about you, to request that we correct any inaccuracies, and to request that we delete your personal information, subject to certain legal exceptions.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. Contact Us</h2>
          <p className="mb-4">
            If you have questions or comments about this Privacy Policy, please contact us at:
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

