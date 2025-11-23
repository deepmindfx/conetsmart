import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { PurchaseModal } from './PurchaseModal';
import { Plan } from '../../types';
import { ChevronRight, Wifi, Clock, Sparkles } from 'lucide-react';
import { getCorrectDurationDisplay } from '../../utils/planDurationHelper';

interface PlansListProps {
  showAll?: boolean;
  onSeeAllClick?: () => void;
}

export const PlansList: React.FC<PlansListProps> = ({ showAll = false, onSeeAllClick }) => {
  const { plans, isPurchaseInProgress, loading } = useData();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  const displayPlans = showAll ? plans : plans.slice(0, 2);

  // Show loading state only during initial load when there are no plans yet
  if (loading && plans.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-28 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-36"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Placeholder removed to avoid misleading availability counts

  const getPlanIcon = (type: string) => {
    switch (type) {
      case '3-hour': return '⚡';
      case 'daily': return '📱';
      case 'weekly': return '📶';
      case 'monthly': return '🚀';
      default: return '📶';
    }
  };

  return (
    <div className="min-h-[calc(100vh-400px)] max-[380px]:min-h-[calc(100vh-350px)] max-[360px]:min-h-[calc(100vh-320px)] max-[350px]:min-h-[calc(100vh-300px)]">
      {isPurchaseInProgress && (
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="text-amber-600" size={16} />
            </div>
            <p className="text-amber-800 text-sm font-medium">
              Purchase in progress. Please wait before starting another transaction.
            </p>
          </div>
        </div>
      )}

      <div className={showAll ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
        {displayPlans.map((plan, index) => {
          return (
            <div
              key={plan.id}
              className={`group rounded-3xl relative p-[1px] transition-all duration-200 ${
                plan.popular
                  ? 'bg-gradient-to-r from-[#f27e31] to-[#b3521b] hover:from-[#d96d2b] hover:to-[#7c2d12]'
                  : 'bg-gradient-to-r from-[#E3F2FD] to-[#BBDEFB] hover:from-[#CFE8FF] hover:to-[#B7D6FF]'
              } ${
                isPurchaseInProgress ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5'
              }`}
              onClick={() => !isPurchaseInProgress && setSelectedPlan(plan)}
            >
              <div className={`relative rounded-3xl overflow-hidden bg-white/20 backdrop-blur-xl border border-white/30`}>
                {/* Creative header: dark glass with mini sparkline */}
                <div className={`p-5 pb-4 rounded-t-3xl ${plan.popular ? 'bg-gradient-to-b from-black/80 to-black/60' : 'bg-gradient-to-b from-slate-900/80 to-slate-800/60'} backdrop-blur-md`}> 
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`tracking-tight ${plan.popular ? 'text-2xl font-black text-white' : 'text-xl font-extrabold text-white'}`}>{plan.name}</h3>
                      <p className="text-white/80 text-xs font-medium mt-0.5">{plan.dataAmount} • {getCorrectDurationDisplay(plan.durationHours)}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.popular ? 'bg-white/10' : 'bg-white/10'}`}>
                      {plan.popular ? <Sparkles className="text-white" size={18} /> : <div className="w-5 h-5 bg-white/70 rounded-full"></div>}
                    </div>
                  </div>
                  {/* faux sparkline */}
                  <div className="mt-3 h-8 w-full relative">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-400/30 via-orange-400/30 to-orange-400/30"></div>
                    <div className="absolute bottom-1 left-0 right-0">
                      <div className="h-0.5 bg-orange-300/50 rounded"></div>
                    </div>
                  </div>
                </div>

                {/* Footer gradient bar (matches Upgrade Account colors) */}
                <div className={`p-4 flex items-center justify-between rounded-b-3xl bg-gradient-to-r from-[#f27e31] via-[#d96d2b] to-[#b3521b]`}>
                  <div>
                    <div className={`leading-none text-white font-black text-xl drop-shadow`}>₦{plan.price.toLocaleString()}</div>
                    <p className={`text-white/90 text-[11px] font-semibold mt-0.5`}>{getCorrectDurationDisplay(plan.durationHours).toUpperCase()}</p>
                  </div>
                  <div className={`inline-flex items-center gap-2 font-bold text-[#7c2d12] bg-white px-3 py-1.5 rounded-xl shadow-sm`}> 
                    <span>Get Now</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPlan && (
        <PurchaseModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
      
      {/* Consistent bottom spacing */}
      <div className="h-8"></div>
    </div>
  );
};