import { useState, useEffect } from 'react';
import { TermsModal } from '@/components/deltaos/TermsModal';
import { LoginScreen } from '@/components/deltaos/LoginScreen';
import { Desktop } from '@/components/deltaos/Desktop';
import { OSData } from '@/types/deltaos';
import { loadUserData, saveUserData, getDefaultUser, getDefaultInstalledApps } from '@/utils/storage';
import { Loader2 } from 'lucide-react';
import { setGlobalVolume } from '@/utils/sounds';

const Index = () => {
  const [showTerms, setShowTerms] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<OSData | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('deltaos_terms_accepted');
    if (accepted) {
      setTermsAccepted(true);
      const data = loadUserData();
      if (data) {
        setUserData(data);
        setIsLoggedIn(true);
      }
    } else {
      setShowTerms(true);
    }
  }, []);

  useEffect(() => {
    if (userData?.user?.settings?.soundEffectsEnabled !== undefined) {
      setGlobalVolume(userData.user.settings.soundEffectsEnabled ? 1.0 : 0);
    }
  }, [userData]);


  const handleTermsAccept = () => {
    localStorage.setItem('deltaos_terms_accepted', 'true');
    setTermsAccepted(true);
    setShowTerms(false);
  };

  const handleTermsDecline = () => {
    window.location.href = 'https://google.com';
  };

  const handleLogin = (name: string, password: string, timezone: string) => {
    const existingData = loadUserData();
    
    if (existingData) {
      if (existingData.user.password === password) {
        setUserData(existingData);
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          setIsLoggedIn(true);
        }, 5000);
      }
    } else {
      const newUserData: OSData = {
        user: {
          ...getDefaultUser(),
          name,
          password,
          timezone,
        },
        customGames: [],
        chatHistory: [],
        files: [],
        installedApps: getDefaultInstalledApps(),
        pinnedItems: [],
      };
      saveUserData(newUserData);
      setUserData(newUserData);
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsLoggedIn(true);
      }, 5000);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
  };

  if (showTerms) {
    return (
      <TermsModal
        open={showTerms}
        onAccept={handleTermsAccept}
        onDecline={handleTermsDecline}
      />
    );
  }

  if (!termsAccepted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-blue-950 to-black relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full blur-3xl" style={{ animation: 'float-1 20s ease-in-out infinite' }} />
          <div className="absolute -bottom-1/2 -right-1/4 w-[700px] h-[700px] bg-gradient-to-br from-indigo-600/15 to-pink-600/15 rounded-full blur-3xl" style={{ animation: 'float-2 25s ease-in-out infinite' }} />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
        <div className="text-center space-y-8 relative z-10" style={{ animation: 'fade-in-up 0.6s ease-out' }}>
          <div className="relative">
            <div className="absolute inset-0 blur-2xl">
              <Loader2 className="w-24 h-24 text-blue-500/50 animate-spin mx-auto" />
            </div>
            <Loader2 className="w-24 h-24 text-blue-400 animate-spin mx-auto relative" />
          </div>
          <div className="space-y-4">
            <h2 className="text-5xl font-black text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text drop-shadow-2xl tracking-tight" style={{ fontFamily: '"Inter", -apple-system, system-ui, sans-serif' }}>
              Loading Delta OS
            </h2>
            <p className="text-gray-300 text-xl font-medium">Preparing your experience...</p>
            <div className="flex justify-center gap-3 mt-6">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" style={{ animation: 'pulse-subtle 1.5s ease-in-out infinite', animationDelay: '0s' }} />
              <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" style={{ animation: 'pulse-subtle 1.5s ease-in-out infinite', animationDelay: '0.3s' }} />
              <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full" style={{ animation: 'pulse-subtle 1.5s ease-in-out infinite', animationDelay: '0.6s' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !userData) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <Desktop userData={userData} onLogout={handleLogout} />;
};

export default Index;
