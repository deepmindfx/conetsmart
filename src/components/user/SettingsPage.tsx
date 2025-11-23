import React from 'react';
import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { PurchaseReceiptModal } from './PurchaseReceiptModal';
import { TransactionHistory } from './TransactionHistory';
import { Purchase } from '../../types';
import { User, Wifi, LogOut, ChevronLeft, ChevronRight, Receipt, Settings, CreditCard, Shield, Bell, HelpCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { getUserPurchases } = useData();

  const handleLogout = async () => {
    try {
      console.log('Settings logout clicked - clearing session...');
      await logout();
    } catch (error) {
      console.error('Error during settings logout:', error);
      // Force redirect even if logout fails
      window.location.replace('/login');
    }
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const itemsPerPage = 5;

  const userPurchases = getUserPurchases(user?.id || '');
  
  // Calculate pagination
  const totalPages = Math.ceil(userPurchases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPurchases = userPurchases.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Show transaction history if requested
  if (showTransactionHistory) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4 mb-8 max-[400px]:flex-col max-[400px]:items-start max-[400px]:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTransactionHistory(false)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-orange-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow max-[400px]:w-full max-[400px]:justify-center"
          >
            <ChevronLeft size={16} />
            Back to Settings
          </Button>
          <h2 className="text-2xl font-bold text-gray-900 max-[400px]:text-xl">Transaction History</h2>
        </div>
        <TransactionHistory />
      </div>
    );
  }

  return (
    <div className="space-y-8 min-h-[calc(100vh-400px)] max-[380px]:min-h-[calc(100vh-350px)] max-[360px]:min-h-[calc(100vh-320px)] max-[350px]:min-h-[calc(100vh-300px)] max-[400px]:space-y-6 pb-20">
      {/* Hero Section */}
      <div className="text-center space-y-3">
        <div className="w-24 h-24 mx-auto mb-2 max-[400px]:w-20 max-[400px]:h-20">
          <img src="/starline-logo.png" alt="ConetSmart" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Settings</h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">Manage your account and preferences</p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 max-[400px]:text-xl">Quick Actions</h2>
          <p className="text-gray-600 max-[400px]:text-sm">Access your most important features</p>
        </div>
        
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => setShowTransactionHistory(true)}
            className="w-full flex items-center justify-between p-6 h-auto bg-white border border-gray-200 rounded-2xl hover:bg-orange-50 hover:border-[#f27e31]/40 transition-all duration-200 shadow-sm hover:shadow group max-[400px]:p-4"
          >
            <div className="flex items-center gap-4 max-[400px]:gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#f27e31] to-[#b3521b] rounded-2xl flex items-center justify-center shadow-lg max-[400px]:w-10 max-[400px]:h-10">
                <Receipt className="text-white" size={24} />
              </div>
              <div className="text-left max-[400px]:flex-1">
                <p className="font-bold text-lg text-gray-900 max-[400px]:text-base">Transaction History</p>
                <p className="text-gray-600 max-[400px]:text-sm">View all your payments and purchases</p>
              </div>
            </div>
            <ChevronRight className="text-gray-400 group-hover:text-[#f27e31] transition-colors duration-200" size={24} />
          </Button>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl max-[400px]:p-4">
        <div className="text-center mb-8 max-[400px]:mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 max-[400px]:text-xl">Profile Information</h2>
          <p className="text-gray-600 max-[400px]:text-sm">Your account details and statistics</p>
        </div>
        
        <div className="flex items-center gap-6 mb-8 max-[400px]:flex-col max-[400px]:gap-4 max-[400px]:mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#f27e31] to-[#b3521b] rounded-3xl flex items-center justify-center shadow-xl border-2 border-white/30 max-[400px]:w-16 max-[400px]:h-16">
            <span className="text-white text-2xl font-black max-[400px]:text-xl">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 max-[400px]:text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 max-[400px]:text-lg">{user?.email}</h3>
            {user?.phone && (
              <p className="text-gray-600 text-lg mb-2 max-[400px]:text-base">{user.phone}</p>
            )}
            <p className="text-gray-600 max-[400px]:text-sm">Member since {new Date(user?.createdAt || '').toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 max-[400px]:grid-cols-1 max-[400px]:gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm max-[400px]:p-4">
            <div className="flex items-center gap-3 mb-3">
              <CreditCard className="text-[#b3521b]" size={20} />
              <p className="text-sm text-gray-600 font-medium">Wallet Balance</p>
            </div>
            <p className="text-2xl font-black text-[#b3521b] max-[400px]:text-xl">₦{user?.walletBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm max-[400px]:p-4">
            <div className="flex items-center gap-3 mb-3">
              <User className="text-orange-600" size={20} />
              <p className="text-sm text-gray-600 font-medium">Referral Code</p>
            </div>
            <p className="text-2xl font-black text-[#b3521b] max-[400px]:text-xl">{user?.referralCode}</p>
          </div>
        </div>
      </div>

      {/* Recent Purchases */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl max-[400px]:p-4">
        <div className="flex items-center justify-between mb-8 max-[400px]:flex-col max-[400px]:gap-4 max-[400px]:mb-6">
          <div className="max-[400px]:text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 max-[400px]:text-xl">Recent Purchases</h2>
            <p className="text-gray-600 max-[400px]:text-sm">Your latest plan purchases and status</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTransactionHistory(true)}
            className="flex items-center gap-2 bg-[#f27e31] text-white font-semibold rounded-2xl hover:bg-[#d96d2b] transition-all duration-200 shadow-sm hover:shadow max-[400px]:w-full max-[400px]:justify-center px-4 py-3"
          >
            <Receipt size={16} />
            View All Transactions
          </Button>
        </div>
        
        {userPurchases.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Receipt className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-600 text-lg font-medium">No purchases yet</p>
            <p className="text-gray-500">Start your journey by purchasing your first plan!</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {currentPurchases.map((purchase) => (
                <div 
                  key={purchase.id} 
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group max-[400px]:p-4"
                  onClick={() => setSelectedPurchase(purchase)}
                >
                  <div className="flex items-center justify-between max-[400px]:flex-col max-[400px]:gap-3 max-[400px]:items-start">
                    <div className="flex items-center gap-4 max-[400px]:w-full">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#f27e31] to-[#b3521b] rounded-2xl flex items-center justify-center shadow-lg max-[400px]:w-10 max-[400px]:h-10">
                        <Receipt className="text-white" size={20} />
                      </div>
                      <div className="max-[400px]:flex-1">
                        <p className="font-bold text-lg text-gray-900 max-[400px]:text-base">Plan Purchase</p>
                        <p className="text-gray-600 max-[400px]:text-sm">
                          {new Date(purchase.purchaseDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right max-[400px]:text-left max-[400px]:w-full">
                      <p className="font-bold text-2xl text-gray-900 mb-2 max-[400px]:text-xl">₦{purchase.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        purchase.status === 'active' 
                          ? 'bg-gradient-to-r from-orange-100 to-orange-100 text-orange-700 border border-orange-200' 
                          : purchase.status === 'expired'
                          ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-200'
                          : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200'
                      }`}>
                        {purchase.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/50 max-[400px]:flex-col max-[400px]:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none disabled:cursor-not-allowed max-[400px]:w-full max-[400px]:justify-center"
                >
                  <ChevronLeft size={16} />
                  Previous
                </Button>
                
                <div className="flex items-center gap-2 max-[400px]:order-first">
                  <span className="text-sm text-gray-600 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none disabled:cursor-not-allowed max-[400px]:w-full max-[400px]:justify-center"
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Account Options */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl max-[400px]:p-4">
        <div className="text-center mb-8 max-[400px]:mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 max-[400px]:text-xl">Account Options</h2>
          <p className="text-gray-600 max-[400px]:text-sm">Manage your account settings and preferences</p>
        </div>
        
        <div className="space-y-4">
          <button className="w-full flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group max-[400px]:p-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#f27e31] to-[#b3521b] rounded-2xl flex items-center justify-center max-[400px]:w-10 max-[400px]:h-10">
              <User className="text-white" size={24} />
            </div>
            <span className="text-gray-900 font-semibold text-lg max-[400px]:text-base">Account Information</span>
            <ChevronRight className="text-gray-400 group-hover:text-[#f27e31] transition-colors duration-200 ml-auto" size={20} />
          </button>
          
          <button className="w-full flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group max-[400px]:p-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#f27e31] to-[#b3521b] rounded-2xl flex items-center justify-center max-[400px]:w-10 max-[400px]:h-10">
              <Shield className="text-white" size={24} />
            </div>
            <span className="text-gray-900 font-semibold text-lg max-[400px]:text-base">Privacy & Security</span>
            <ChevronRight className="text-gray-400 group-hover:text-[#f27e31] transition-colors duration-200 ml-auto" size={20} />
          </button>
          
          <button className="w-full flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group max-[400px]:p-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#f27e31] to-[#d96d2b] rounded-2xl flex items-center justify-center max-[400px]:w-10 max-[400px]:h-10">
              <Bell className="text-white" size={24} />
            </div>
            <span className="text-gray-900 font-semibold text-lg max-[400px]:text-base">Notifications</span>
            <ChevronRight className="text-gray-400 group-hover:text-[#d96d2b] transition-colors duration-200 ml-auto" size={20} />
          </button>
          
          <button className="w-full flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group max-[400px]:p-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FBBC05] to-[#F29900] rounded-2xl flex items-center justify-center max-[400px]:w-10 max-[400px]:h-10">
              <HelpCircle className="text-white" size={24} />
            </div>
            <span className="text-gray-900 font-semibold text-lg max-[400px]:text-base">Help & Support</span>
            <ChevronRight className="text-gray-400 group-hover:text-[#F29900] transition-colors duration-200 ml-auto" size={20} />
          </button>
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="text-center mb-8">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full max-w-md flex items-center justify-center gap-3 py-4 px-8 bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-2xl font-semibold transition-all duration-200 shadow-sm hover:shadow max-[400px]:w-full max-[400px]:justify-center"
        >
          <LogOut size={20} />
          Sign Out
        </Button>
      </div>
      
      {/* Purchase Receipt Modal */}
      {selectedPurchase && (
        <PurchaseReceiptModal
          purchase={selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
        />
      )}
    </div>
  );
};