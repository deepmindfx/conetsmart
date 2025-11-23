import React from 'react';
import { Home, Zap, Gift, User } from 'lucide-react';

type ActivePage = 'home' | 'plans' | 'referrals' | 'settings';

interface BottomNavigationProps {
  activePage: ActivePage;
  onPageChange: (page: ActivePage) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activePage,
  onPageChange,
}) => {
  const navItems = [
    { id: 'home' as ActivePage, icon: Home, label: 'Home' },
    { id: 'plans' as ActivePage, icon: Zap, label: 'Plans' },
    { id: 'referrals' as ActivePage, icon: Gift, label: 'Referrals' },
    { id: 'settings' as ActivePage, icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center">
      <div className="w-[90%] max-w-md">
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl px-6 py-4 shadow-2xl border border-gray-100/50">
          <div className="flex items-center justify-between">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex flex-col items-center transition-all duration-300 ${
                    isActive ? 'scale-110' : 'hover:scale-105'
                  }`}
                >
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#f27e31] text-white shadow-lg shadow-orange-500/25' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <span className={`text-[10px] mt-1.5 font-medium transition-colors duration-300 ${
                    isActive ? 'text-[#f27e31]' : 'text-gray-500'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};