import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Card } from '../ui/Card';
import { Clock, MapPin, Wifi, ArrowRight, TrendingUp, Send, ArrowDown } from 'lucide-react';

interface RecentTransactionsProps {
  onNavigateToHistory?: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ onNavigateToHistory }) => {
  const { user } = useAuth();
  const { getUserTransactions, plans, locations } = useData();

  const userTransactions = getUserTransactions(user?.id || '');
  
  // Get last 2 transactions, sorted by newest first
  const recentTransactions = userTransactions
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 2);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-orange-100 text-orange-700';
      case 'expired':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'success':
        return 'bg-orange-100 text-orange-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
      case 'pending':
        return 'Pending';
      case 'success':
        return 'Success';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'transfer_sent':
        return <Send size={14} className="text-red-600" />;
      case 'transfer_received':
        return <ArrowDown size={14} className="text-orange-600" />;
      case 'wallet_funding':
        return <ArrowDown size={14} className="text-orange-600" />;
      case 'plan_purchase':
        return <Wifi size={14} className="text-purple-600" />;
      default:
        return <Wifi size={14} className="text-gray-600" />;
    }
  };

  const getTransactionTitle = (transaction: any) => {
    switch (transaction.type) {
      case 'transfer_sent':
        return 'Transfer Sent';
      case 'transfer_received':
        return 'Transfer Received';
      case 'wallet_funding':
        return 'Wallet Funding';
      case 'plan_purchase':
        const plan = plans.find(p => p.id === transaction.plan_id);
        return plan?.name || 'Plan Purchase';
      default:
        return 'Transaction';
    }
  };

  const getTransactionSubtitle = (transaction: any) => {
    switch (transaction.type) {
      case 'transfer_sent':
        const recipient = transaction.transfer_to_user;
        if (recipient) {
          const name = recipient.first_name && recipient.last_name 
            ? `${recipient.first_name} ${recipient.last_name}`
            : recipient.email;
          return `Sent to ${name}`;
        }
        return 'Funds transferred to another user';
      case 'transfer_received':
        const sender = transaction.transfer_from_user;
        if (sender) {
          const name = sender.first_name && sender.last_name 
            ? `${sender.first_name} ${sender.last_name}`
            : sender.email;
          return `Received from ${name}`;
        }
        return 'Funds received from another user';
      case 'wallet_funding':
        return 'Wallet topped up';
      case 'plan_purchase':
        const location = locations.find(l => l.id === transaction.location_id);
        return location?.name || 'Plan purchased';
      default:
        return 'Transaction completed';
    }
  };

  if (recentTransactions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-[#f27e31] to-[#b3521b] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <TrendingUp className="text-white" size={28} />
        </div>
        <h4 className="font-bold text-gray-900 mb-2 text-lg">Start Your Journey</h4>
        <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
          Purchase your first plan to see your transaction history and start enjoying high-speed internet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Activity Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-600 font-medium">
            {recentTransactions.length} recent transaction{recentTransactions.length !== 1 ? 's' : ''}
          </span>
        </div>
        <span className="text-xs text-gray-500">Last 30 days</span>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {recentTransactions.map((transaction, index) => {
          const transactionDate = new Date(transaction.created_at);
          const isTransferSent = transaction.type === 'transfer_sent';
          const isTransferReceived = transaction.type === 'transfer_received';
          
          return (
            <div 
              key={transaction.id} 
              className="group relative bg-gray-50 hover:bg-orange-50 p-4 rounded-2xl border border-gray-100 hover:border-[#f27e31]/20 transition-all duration-300 hover:shadow-sm max-[450px]:p-3 max-[340px]:p-2.5"
            >
              {/* Status indicator dot */}
              <div className={`absolute left-4 top-4 w-3 h-3 rounded-full ${
                transaction.status === 'success' || transaction.status === 'active' ? 'bg-orange-500' : 
                transaction.status === 'failed' || transaction.status === 'expired' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              
              <div className="ml-6 flex items-center justify-between max-[450px]:ml-5 max-[450px]:flex-col max-[450px]:items-start max-[450px]:gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2 max-[450px]:space-x-2 max-[450px]:mb-1.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 ${
                      transaction.status === 'success' || transaction.status === 'active' ? 'bg-orange-100' : 
                      transaction.status === 'failed' || transaction.status === 'expired' ? 'bg-red-100' : 'bg-yellow-100'
                    } max-[450px]:w-9 max-[450px]:h-9`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate max-[450px]:text-[13px] max-[340px]:text-[12px]">
                        {getTransactionTitle(transaction)}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1 max-[450px]:text-[11px]">
                        <span className="truncate">{getTransactionSubtitle(transaction)}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">
                          {transactionDate.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          })}, {transactionDate.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {transaction.type === 'plan_purchase' && transaction.status === 'active' && transaction.mikrotik_username && (
                        <div className="mt-2 max-[340px]:mt-1.5">
                          <span className="text-xs text-[#f27e31] font-medium bg-orange-50 px-2 py-1 rounded-lg inline-block max-[340px]:text-[11px] max-[340px]:px-1.5 max-[340px]:py-0.5">
                            User: {transaction.mikrotik_username}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right max-[450px]:w-full max-[450px]:flex max-[450px]:items-center max-[450px]:justify-between">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${getStatusColor(transaction.status)} max-[450px]:text-[11px] max-[450px]:px-2.5 max-[450px]:py-0.5`}>
                    {getStatusText(transaction.status)}
                  </span>
                  <p className={`text-lg font-bold mt-1 max-[450px]:text-base ${
                    isTransferSent ? 'text-red-600' : 
                    isTransferReceived ? 'text-orange-600' : 
                    'text-gray-900'
                  }`}>
                    {isTransferSent ? '-' : isTransferReceived ? '+' : ''}₦{transaction.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* View All Button */}
      {recentTransactions.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <button 
            onClick={onNavigateToHistory}
            className="w-full bg-gradient-to-r from-[#f27e31] to-[#b3521b] hover:from-[#d96d2b] hover:to-[#7c2d12] text-white p-3 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg flex items-center justify-center space-x-2 group"
          >
            <span>View All Transactions</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};
