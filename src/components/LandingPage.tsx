import React from 'react';
import { Wifi, Zap, Smartphone, Shield, Globe, ChevronRight, Download } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 relative overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f27e31] to-[#b3521b] flex items-center justify-center text-white">
                <img src="/starline-logo.png" alt="Logo" className="w-5 h-5 object-contain brightness-0 invert" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900">ConetSmart</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-[#f27e31] transition-colors">Features</a>
              <a href="#download" className="text-sm font-medium text-gray-600 hover:text-[#f27e31] transition-colors">Download App</a>
              <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-[#f27e31] transition-colors">Contact</a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <a href="/login" className="hidden md:inline-flex text-sm font-semibold text-gray-900 hover:text-[#f27e31] transition-colors">
                Sign in
              </a>
              <a 
                href="/login" 
                className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#f27e31] hover:bg-[#d96d2b] transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-48 md:pb-32 px-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-[#f27e31]/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-semibold mb-6 animate-fade-in-up">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            Now with Virtual Accounts & Instant Top-ups
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            Reliable Internet <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f27e31] to-[#d96d2b]">
              Simplified for You
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Experience lightning-fast connectivity with flexible plans. Manage your wallet, fund instantly via virtual account, and stay connected—all in one app.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="/login" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white bg-[#f27e31] hover:bg-[#d96d2b] transition-all shadow-xl shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-1"
            >
              Create Free Account
              <ChevronRight className="w-4 h-4" />
            </a>
            <a 
              href="https://xgvxtnvdxqqeehjrvkwr.supabase.co/storage/v1/object/public/asuktek/AsukTek.apk" 
              download
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <Download className="w-4 h-4" />
              Download App
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose ConetSmart?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Everything you need for seamless internet access, built into one powerful platform.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Wifi,
                title: "High-Speed Internet",
                desc: "Enjoy buffer-free streaming and lag-free gaming with our optimized network infrastructure."
              },
              {
                icon: Smartphone,
                title: "Smart Wallet & Virtual Account",
                desc: "Get your own dedicated bank account number. Transfer funds instantly and manage your balance."
              },
              {
                icon: Shield,
                title: "Secure & Reliable",
                desc: "Your data and transactions are protected with bank-grade security protocols."
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-[#f27e31]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section id="download" className="py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-[#1a1a1a] rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
            {/* Abstract Shapes */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#f27e31] opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500 opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Get the ConetSmart App
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Manage your plans, check data usage, and top up your wallet on the go. Download our Android app today for the best experience.
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="https://xgvxtnvdxqqeehjrvkwr.supabase.co/storage/v1/object/public/asuktek/AsukTek.apk" 
                  download
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white hover:bg-gray-50 transition-colors text-gray-900 font-semibold"
                >
                  <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M17.523 15.3414C17.523 15.3414 17.563 15.4494 17.623 15.5454C17.743 15.7374 17.923 16.0254 18.123 16.3414C18.323 16.6574 18.523 16.9734 18.643 17.1654C18.703 17.2614 18.743 17.3694 18.743 17.3694C19.063 17.9094 19.383 18.4494 19.383 18.4494C19.643 18.8814 19.843 19.2894 19.923 19.6254C19.983 19.9614 19.903 20.3454 19.643 20.7294C19.383 21.1134 18.943 21.3534 18.443 21.3534H5.563C5.063 21.3534 4.623 21.1134 4.363 20.7294C4.103 20.3454 4.023 19.9614 4.083 19.6254C4.163 19.2894 4.363 18.8814 4.623 18.4494L5.263 17.3694C5.263 17.3694 5.303 17.2614 5.363 17.1654C5.483 16.9734 5.683 16.6574 5.883 16.3414C6.083 16.0254 6.263 15.7374 6.383 15.5454C6.443 15.4494 6.483 15.3414 6.483 15.3414L7.123 14.2614C7.123 14.2614 7.163 14.1534 7.223 14.0574C7.343 13.8654 7.543 13.5494 7.743 13.2334C7.943 12.9174 8.123 12.6294 8.243 12.4374C8.303 12.3414 8.343 12.2334 8.343 12.2334L12.003 6.0414L15.663 12.2334C15.663 12.2334 15.703 12.3414 15.763 12.4374C15.883 12.6294 16.063 12.9174 16.263 13.2334C16.463 13.5494 16.663 13.8654 16.783 14.0574C16.843 14.1534 16.883 14.2614 16.883 14.2614L17.523 15.3414ZM15.663 5.0814L13.403 1.2414C13.143 0.8094 12.703 0.5694 12.203 0.5694H11.803C11.303 0.5694 10.863 0.8094 10.603 1.2414L8.343 5.0814C8.083 5.5134 8.083 6.0414 8.343 6.4734L10.603 10.3134C10.863 10.7454 11.303 10.9854 11.803 10.9854H12.203C12.703 10.9854 13.143 10.7454 13.403 10.3134L15.663 6.4734C15.923 6.0414 15.923 5.5134 15.663 5.0814Z" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-gray-500 font-medium">Download APK</span>
                    <span className="text-sm font-bold">Direct Download</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Footer */}
      <footer id="contact" className="bg-white border-t border-gray-100 pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f27e31] to-[#b3521b] flex items-center justify-center text-white">
                  <img src="/starline-logo.png" alt="Logo" className="w-5 h-5 object-contain brightness-0 invert" />
                </div>
                <span className="text-lg font-bold tracking-tight text-gray-900">ConetSmart</span>
              </div>
              <p className="text-gray-500 leading-relaxed max-w-xs">
                Empowering you with fast, reliable internet connectivity. Join thousands of satisfied users today.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>ConetSmart behind sabon layi behind sabon layi round about</li>
                <li><a href="tel:08033707947" className="hover:text-[#f27e31]">08033707947</a></li>
                <li><a href="tel:08036506511" className="hover:text-[#f27e31]">08036506511</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#" className="hover:text-[#f27e31]">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#f27e31]">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} ConetSmart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;