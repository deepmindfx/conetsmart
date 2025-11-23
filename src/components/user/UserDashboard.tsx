import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { WalletCard } from './WalletCard';
import { RecentTransactions } from './RecentTransactions';

import { PlansList } from './PlansList';
import { VirtualAccountPage } from './VirtualAccountPage';
import { BottomNavigation } from './BottomNavigation';
import { ReferralPage } from './ReferralPage';
import { SettingsPage } from './SettingsPage';
import { NotificationBanner } from './NotificationBanner';
import { TransferModal } from './TransferModal';
import { Bell, ChevronDown, LogOut, Eye, EyeOff, Copy, Smartphone, CreditCard, ArrowUpRight, Clock, Send, TrendingUp } from 'lucide-react';

type ActivePage = 'home' | 'plans' | 'referrals' | 'settings' | 'virtual-account';

export const UserDashboard: React.FC = () => {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const { user, refreshSession, logout } = useAuth();
  const { getUserPurchases, refreshData } = useData();

  const handleLogout = async () => {
    try {
      console.log('User logout clicked - clearing session...');
      await logout();
    } catch (error) {
      console.error('Error during user logout:', error);
      // Force redirect even if logout fails
      window.location.replace('/login');
    }
  };
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isOnline, isSlow } = useNetworkStatus();
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Remove the activation logic - we'll show recent transactions instead

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh both auth session and data
      await Promise.all([
        refreshSession(),
        refreshData()
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return (
          <div className="space-y-6">
            <NotificationBanner />

            {/* Premium Wallet Card */}
            <div className="mx-4 relative">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100/50">
                {/* Balance Section */}
                <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-br from-gray-50/50 to-white">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600 text-sm font-medium">Available Balance</p>
                      <button
                        onClick={() => setShowBalance(!showBalance)}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
                        title={showBalance ? 'Hide balance' : 'Show balance'}
                      >
                        {showBalance ? <Eye size={16} className="text-gray-600" /> : <EyeOff size={16} className="text-gray-600" />}
                      </button>
                    </div>
                    <h2 className="text-2xl min-[320px]:text-3xl min-[375px]:text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
                      {showBalance 
                        ? `₦${(user?.walletBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : '₦****.**'}
                    </h2>
                  </div>

                  {/* Account Details or Creation Prompt */}
                  {user?.virtualAccountNumber ? (
                    <div className="bg-gradient-to-r from-orange-50 to-orange-50 rounded-2xl p-3 sm:p-4 border border-orange-100 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Smartphone size={14} className="text-orange-600" />
                            <p className="text-orange-900 text-xs font-semibold">Virtual Account</p>
                          </div>
                          <p className="text-orange-800 font-mono text-sm font-bold tracking-wide mb-1 break-all">
                            {user.virtualAccountNumber}
                          </p>
                          {user?.virtualAccountBankName && (
                            <p className="text-orange-700 text-xs">
                              <span className="font-medium">{user.virtualAccountBankName}</span>
                            </p>
                          )}
                        </div>
                        <button
                          onClick={async () => {
                            await navigator.clipboard.writeText(user.virtualAccountNumber as string);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex-shrink-0"
                          title="Copy account number"
                          aria-label="Copy account number"
                        >
                          <Copy size={16} className={copied ? 'text-orange-200' : 'text-white'} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="bg-gradient-to-r from-orange-50 to-orange-50 rounded-2xl p-3 sm:p-4 border border-orange-200 hover:from-orange-100 hover:to-orange-100 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md mb-3"
                      onClick={() => setActivePage('virtual-account')}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActivePage('virtual-account'); } }}
                      title="Setup virtual account"
                      aria-label="Setup virtual account"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Smartphone size={18} className="text-white" />
                          </div>
                          <div>
                            <p className="text-orange-900 font-semibold text-sm mb-0.5">Setup Account</p>
                            <p className="text-orange-800 text-xs">Enable instant deposits</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-orange-900 font-semibold">
                          <span className="text-xs">Setup</span>
                          <ArrowUpRight size={16} className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={() => setShowTransferModal(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 text-xs sm:text-sm"
                    >
                      <Send size={14} />
                      <span>Send</span>
                    </button>
                    <button
                      onClick={() => setActivePage('virtual-account')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 text-xs sm:text-sm"
                    >
                      <TrendingUp size={14} />
                      <span>Add Funds</span>
                    </button>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/5 to-orange-500/5 rounded-full blur-2xl"></div>
              </div>
            </div>

            {/* Quick Actions removed as requested */}

            {/* Upgrade Account - Redesigned */}
            <div className="mx-4">
              <div className="relative overflow-hidden bg-gradient-to-br from-[#f27e31] via-[#d96d2b] to-[#b3521b] rounded-3xl p-6 shadow-xl">
                {/* Background Pattern */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>
                </div>
                
                <div className="relative z-10 flex items-center justify-between max-[380px]:flex-col max-[380px]:items-start max-[380px]:gap-3">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                      <CreditCard size={26} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1 max-[380px]:text-base">Upgrade Account</h3>
                      <p className="text-white/90 text-sm max-[380px]:text-xs leading-relaxed">
                        Create a virtual account to enjoy <span className="font-semibold">higher limits & faster funding</span>
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActivePage('virtual-account')}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 p-3 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-white/30 shadow-lg max-[380px]:self-stretch max-[380px]:w-full max-[380px]:justify-center"
                  >
                    <ArrowUpRight size={22} className="text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Transactions - Redesigned */}
            <div className="mx-4">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-50 to-orange-50 px-6 py-5 border-b border-gray-100 max-[380px]:px-4 max-[380px]:py-4">
                  <div className="flex items-center justify-between max-[380px]:flex-col max-[380px]:items-start max-[380px]:gap-2">
                    <div className="flex items-center space-x-3 max-[380px]:space-x-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#f27e31] to-[#b3521b] rounded-2xl flex items-center justify-center shadow-md max-[380px]:w-9 max-[380px]:h-9">
                        <Clock size={18} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-bold text-lg max-[380px]:text-base">Recent Transactions</h3>
                        <p className="text-gray-600 text-sm max-[380px]:text-xs">Your latest activity</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActivePage('settings')}
                      className="text-[#f27e31] text-sm font-semibold hover:text-[#d96d2b] transition-colors flex items-center space-x-1 max-[380px]:text-xs"
                    >
                      <span>See all</span>
                      <ArrowUpRight size={12} />
                    </button>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
            <RecentTransactions onNavigateToHistory={() => setActivePage('settings')} />
                </div>
              </div>
            </div>

            {/* Quick Services - redesigned */}
            <div className="mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Quick Services</h3>
                <button 
                  onClick={() => setActivePage('plans')}
                  className="text-[#f27e31] text-sm font-medium flex items-center gap-1"
                >
                  View all
                  <ArrowUpRight size={16} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Hourly', color: 'bg-[#E3F2FD] text-[#1E88E5]', dot: 'bg-[#1E88E5]' },
                  { label: 'Daily', color: 'bg-[#fff7ed] text-[#d96d2b]', dot: 'bg-[#d96d2b]' },
                  { label: 'Weekly', color: 'bg-[#FFF3E0] text-[#EF6C00]', dot: 'bg-[#EF6C00]' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setActivePage('plans')}
                    className={`flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100`}
                  >
                    <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center mb-3`}> 
                      <div className={`w-6 h-6 ${item.dot} rounded-full`}></div>
                    </div>
                    <span className="text-gray-800 text-sm font-semibold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Plans */}
            <div className="mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Popular Plans</h3>
                <div className="text-orange-600 text-sm font-medium bg-orange-50 px-3 py-1 rounded-full">
                  Save up to 20%
                </div>
              </div>
            <PlansList onSeeAllClick={() => setActivePage('plans')} />
            </div>
          </div>
        );
      case 'plans':
        return <PlansList showAll={true} />;
      case 'referrals':
        return <ReferralPage />;
      case 'settings':
        return <SettingsPage />;
      case 'virtual-account':
        return <VirtualAccountPage onBack={() => setActivePage('home')} />;
      default:
        return null;
    }
  };

  // Don't show header and bottom nav for virtual account page
  if (activePage === 'virtual-account') {
    return renderContent();
  }

  return (
    <div className="min-h-screen bg-[#f27e31]">
      <div className="max-w-md mx-auto bg-[#f1f1f1] min-h-screen relative">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#f27e31] via-[#d96d2b] to-[#b3521b] px-3 sm:px-4 pt-8 sm:pt-10 pb-7 sm:pb-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-white/10 rounded-b-3xl"></div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                  <img src="/starline-logo.png" alt="ConetSmart" className="h-7 w-7 sm:h-8 sm:w-8 object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white/90 text-xs">Welcome</span>
                  <span className="text-white font-semibold leading-tight">{user?.email?.split('@')[0] || 'User'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-red-600 rounded-xl sm:rounded-2xl font-semibold shadow-sm border border-red-100 hover:bg-red-50 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
          

          {/* Network Status Indicator */}
          {(!isOnline || isSlow) && (
            <div className="mb-4 p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 relative z-10">
              <div className="flex items-center gap-3 text-white text-sm font-medium">
                {!isOnline ? (
                  <>
                    <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse shadow-lg"></div>
                    <span>You're offline. Some features may not work.</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg"></div>
                    <span>Slow connection detected. Please be patient.</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        <main className="pb-40 min-h-[calc(100vh-200px)] max-[380px]:pb-36 max-[360px]:pb-32 max-[350px]:pb-28">
          <div className="px-4 -mt-4 relative">
            <div className="min-h-[calc(100vh-300px)] max-[380px]:min-h-[calc(100vh-280px)] max-[360px]:min-h-[calc(100vh-260px)] max-[350px]:min-h-[calc(100vh-240px)]">
              {renderContent()}
            </div>
          </div>
        </main>
        <BottomNavigation activePage={activePage} onPageChange={setActivePage} />
        
        {/* Transfer Modal */}
        <TransferModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          onSuccess={async () => {
            // Refresh all data including transactions and user profile
            await Promise.all([
              refreshData(),
              refreshSession()
            ]);
          }}
        />
      </div>
    </div>
  );
};