import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { AuthForm } from './components/auth/AuthForm';
import { LandingPage } from './components/LandingPage';
import { UserDashboard } from './components/user/UserDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { initPWASessionManagement, debugStorage } from './utils/pwaUtils';
import { clearSessionAndRedirect } from './utils/sessionClear';

// Import auth debug utilities (available in console as window.authDebug)
import './utils/authDebug';
// Import auth test utilities (available in console as window.testAuth)
import './utils/testAuth';
// Import data loading test utilities (available in console as window.testDataLoading)
import './utils/testDataLoading';
// Import stuck loading debug utility (available in console as window.debugStuckLoading)
import './utils/debugStuckLoading';
// Import data loading debug utility (available in console as window.debugDataLoading)
import './utils/debugDataLoading';
// Import Supabase data debug utility (available in console as window.supabaseDebug)
import './utils/supabaseDataDebug';

// Make PWA debug available in console
if (typeof window !== 'undefined') {
  (window as any).pwaDebug = debugStorage;
}

function AppContent() {
  const { user, authUser, isAdmin, loading, shouldShowLogin, sessionLoaded } = useAuth();
  const [startupWaitExpired, setStartupWaitExpired] = useState(false);
  const path = window.location.pathname;

  useEffect(() => {
    const t = setTimeout(() => setStartupWaitExpired(true), 8000);
    return () => clearTimeout(t);
  }, []);

  // Public routes that don't require auth and should be visible even if logged in
  if (path === '/privacy') {
    return <PrivacyPolicy />;
  }
  if (path === '/terms') {
    return <TermsOfService />;
  }

  // Show loading while waiting for initial session, but fail-safe after timeout
  if ((!sessionLoaded && !startupWaitExpired) || ((loading && !authUser) && !startupWaitExpired)) {
    return (
      <div className="min-h-screen bg-[#f27e31] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <div className="text-white text-xl">Loading ConetSmart...</div>
        </div>
      </div>
    );
  }

  // User is authenticated - show appropriate dashboard (even if profile is still loading)
  if (authUser) {
    if (isAdmin) {
      return <AdminDashboard />;
    }
    return <UserDashboard />;
  }

  // Not authenticated - show landing page at root, login elsewhere
  const isAdminRoute = path.includes('/admin');
  if (path === '/' || path === '/index.html') {
    return <LandingPage />;
  }
  return <AuthForm isAdmin={isAdminRoute} />;
}

function App() {
  const [isHandlingRefresh, setIsHandlingRefresh] = useState(false);

  useEffect(() => {
    // Check if the page was refreshed
    const entries = performance.getEntriesByType("navigation");
    const isRefresh = entries.length > 0 && (entries[0] as PerformanceNavigationTiming).type === "reload";
    
    if (isRefresh) {
      setIsHandlingRefresh(true);
      console.log('Page refreshed - clearing all data and redirecting to login...');
      
      const clearAndRedirect = async () => {
        await clearSessionAndRedirect();
      };
      
      clearAndRedirect();
    } else {
      // Initialize PWA session management only on normal navigation
      initPWASessionManagement();
      console.log('PWA initialized. Debug with: window.pwaDebug()');
    }
  }, []);

  if (isHandlingRefresh) {
    return (
      <div className="min-h-screen bg-[#f27e31] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <div className="text-white text-xl">Clearing session data...</div>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;