import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, KeyRound, ArrowRight, ArrowLeft, User, Lock, Globe, Sparkles } from 'lucide-react';
import { importData, loadUserData } from '@/utils/storage';
import { toast } from 'sonner';

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Toronto', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Dubai', 'Australia/Sydney', 'Pacific/Auckland'
];

interface LoginScreenProps {
  onLogin: (name: string, password: string, timezone: string) => void;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [isSignUp, setIsSignUp] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [pin, setPin] = useState('');
  const [usePinLogin, setUsePinLogin] = useState(false);
  const [pinLength, setPinLength] = useState<4 | 6>(4);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userData = loadUserData();
    if (userData?.user.settings.pinEnabled && userData.user.settings.pin) {
      setUsePinLogin(true);
      setPinLength(userData.user.settings.pinLength);
      setName(userData.user.name);
      setTimezone(userData.user.timezone);
      setIsSignUp(false);
    }
  }, []);

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!name.trim()) {
        toast.error('Please enter your name');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!password.trim()) {
        toast.error('Please enter a password');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (usePinLogin) {
      if (!pin || pin.length !== pinLength) {
        toast.error(`Please enter your ${pinLength}-digit PIN`);
        return;
      }
      
      const userData = loadUserData();
      if (!userData || userData.user.settings.pin !== pin) {
        toast.error('Invalid PIN');
        setPin('');
        return;
      }
      
      onLogin(userData.user.name, userData.user.password, userData.user.timezone);
    } else {
      if (isSignUp && currentStep !== 3) {
        handleNextStep();
        return;
      }
      
      if (name && password && timezone) {
        onLogin(name, password, timezone);
      }
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importData(file);
      toast.success('Data imported successfully!');
      onLogin(data.user.name, data.user.password, data.user.timezone);
    } catch (error) {
      toast.error('Failed to import data. Please check the file format.');
    }
  };

  const switchToLogin = () => {
    setIsSignUp(false);
    setCurrentStep(1);
  };

  const switchToSignUp = () => {
    setIsSignUp(true);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-gray-950 via-blue-950 to-black">
      {/* Animated background mesh gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full blur-3xl" style={{ animation: 'float-1 20s ease-in-out infinite' }} />
        <div className="absolute -bottom-1/2 -right-1/4 w-[700px] h-[700px] bg-gradient-to-br from-indigo-600/15 to-pink-600/15 rounded-full blur-3xl" style={{ animation: 'float-2 25s ease-in-out infinite' }} />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-violet-600/10 to-cyan-600/10 rounded-full blur-3xl" style={{ animation: 'float-3 30s ease-in-out infinite' }} />
        <div className="absolute bottom-1/3 left-1/3 w-[600px] h-[600px] bg-gradient-to-br from-purple-600/15 to-blue-600/15 rounded-full blur-3xl" style={{ animation: 'float-4 22s ease-in-out infinite' }} />
      </div>
      
      {/* Floating particles with smoother animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: 'float-particle 8s ease-in-out infinite',
              animationDelay: `${Math.random() * 8}s`,
            }}
          />
        ))}
      </div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
      
      <Card className="w-full max-w-md relative backdrop-blur-2xl bg-gray-900/80 shadow-2xl border border-gray-700/50 overflow-visible group hover:border-blue-500/50 transition-all duration-500" style={{ animation: 'fade-in-up 0.6s ease-out' }}>
        {/* Premium glassmorphism effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 rounded-lg pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-lg pointer-events-none" />
        
        {/* Animated gradient border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" style={{ animation: 'shimmer 3s linear infinite' }} />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
        
        <CardHeader className="text-center relative pt-10 pb-6 overflow-visible">
          <div className="flex items-center justify-center mb-4 overflow-visible">
            <div className="relative overflow-visible">
              <Sparkles className="h-12 w-12 text-blue-400 mr-3 absolute -left-14 z-10" style={{ animation: 'pulse-subtle 3s ease-in-out infinite' }} />
              <CardTitle className="text-6xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl" style={{ fontFamily: '"Inter", "SF Pro Display", -apple-system, system-ui, sans-serif', letterSpacing: '-0.02em' }}>
                Delta OS
              </CardTitle>
              <Sparkles className="h-12 w-12 text-pink-400 ml-3 absolute -right-14 top-0 z-10" style={{ animation: 'pulse-subtle 3s ease-in-out infinite', animationDelay: '1.5s' }} />
            </div>
          </div>
          <CardDescription className="text-base font-semibold text-gray-400 tracking-wide" style={{ fontFamily: '"SF Mono", "Monaco", "Consolas", monospace' }}>
            v9 — The Future of Computing
          </CardDescription>
          <div className="mt-2 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {usePinLogin ? (
              <div className="animate-fade-in">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-2 border border-blue-500/20 backdrop-blur-sm" style={{ animation: 'float-gentle 3s ease-in-out infinite' }}>
                    <KeyRound className="h-12 w-12 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl text-gray-100 tracking-tight" style={{ fontFamily: '"Inter", -apple-system, system-ui, sans-serif' }}>
                      Welcome back, {name}!
                    </h3>
                    <p className="text-base text-gray-400 mt-2 font-medium">
                      Enter your {pinLength}-digit secure PIN
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mt-8">
                  <Input
                    type="password"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={pinLength}
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setPin(value);
                      if (value.length === pinLength) {
                        setTimeout(() => {
                          const form = e.target.form;
                          form?.requestSubmit();
                        }, 100);
                      }
                    }}
                    placeholder={'••••••'.slice(0, pinLength)}
                    className="text-center text-4xl tracking-[1em] font-bold border-2 border-gray-700 bg-gray-800/50 text-gray-100 focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 rounded-xl shadow-inner"
                    autoFocus
                    data-testid="input-pin"
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full mt-6 hover:bg-blue-500/10 text-gray-300 hover:text-blue-300 transition-all duration-300 rounded-lg py-6 font-medium"
                  onClick={() => {
                    setUsePinLogin(false);
                    setPin('');
                    setName('');
                  }}
                  data-testid="button-use-password"
                >
                  Use Password Instead
                </Button>
              </div>
            ) : (
              <>
                {isSignUp && (
                  <div className="flex justify-center gap-3 mb-6">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`h-2.5 rounded-full transition-all duration-700 ease-out ${
                          step === currentStep
                            ? 'w-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-blue-500/50'
                            : step < currentStep
                            ? 'w-2.5 bg-green-400 shadow-md shadow-green-500/50'
                            : 'w-2.5 bg-gray-700'
                        }`}
                        data-testid={`progress-step-${step}`}
                      />
                    ))}
                  </div>
                )}

                <div className="relative overflow-hidden min-h-[400px]">
                  <div
                    className="flex transition-all duration-700 ease-in-out"
                    style={{
                      transform: isSignUp ? `translateX(-${(currentStep - 1) * 100}%)` : 'translateX(0)',
                    }}
                  >
                    {/* Step 1: Name */}
                    <div className="w-full flex-shrink-0 space-y-4">
                      <div className="text-center mb-8 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-4 border border-blue-500/20 backdrop-blur-sm" style={{ animation: 'float-gentle 3s ease-in-out infinite' }}>
                          <User className="h-12 w-12 text-blue-400" />
                        </div>
                        <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight" style={{ fontFamily: '"Inter", -apple-system, system-ui, sans-serif' }}>
                          What's your name?
                        </h3>
                        <p className="text-base text-gray-400 mt-3 font-medium">
                          Let's personalize your experience
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-base font-semibold text-gray-300">Full Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your full name"
                          required
                          autoFocus={isSignUp && currentStep === 1}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && isSignUp) {
                              e.preventDefault();
                              handleNextStep();
                            }
                          }}
                          className="border-2 border-gray-700 bg-gray-800/50 text-gray-100 placeholder:text-gray-500 focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-lg py-6 rounded-xl"
                          data-testid="input-name"
                        />
                      </div>

                      {!isSignUp && (
                        <>
                          <div className="space-y-3">
                            <Label htmlFor="password-login" className="text-base font-semibold text-gray-300">Password</Label>
                            <Input
                              id="password-login"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter your secure password"
                              required
                              className="border-2 border-gray-700 bg-gray-800/50 text-gray-100 placeholder:text-gray-500 focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-lg py-6 rounded-xl"
                              data-testid="input-password-login"
                            />
                          </div>
                          
                          <div className="space-y-3">
                            <Label htmlFor="timezone-login" className="text-base font-semibold text-gray-300">Timezone</Label>
                            <Select value={timezone} onValueChange={setTimezone}>
                              <SelectTrigger className="border-2 border-gray-700 bg-gray-800/50 text-gray-100 py-6 rounded-xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300" data-testid="select-timezone-login">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                {TIMEZONES.map((tz) => (
                                  <SelectItem key={tz} value={tz} className="text-gray-100 focus:bg-gray-700">
                                    {tz}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      {isSignUp ? (
                        <Button
                          type="button"
                          className="w-full mt-8 py-7 text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 shadow-2xl shadow-blue-500/50 hover:shadow-purple-500/50 transition-all duration-500 rounded-xl hover:scale-[1.02] active:scale-[0.98]"
                          onClick={handleNextStep}
                          data-testid="button-next-step-1"
                        >
                          Continue
                          <ArrowRight className="ml-2 h-6 w-6" />
                        </Button>
                      ) : (
                        <Button type="submit" className="w-full mt-8 py-7 text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 shadow-2xl shadow-blue-500/50 hover:shadow-purple-500/50 transition-all duration-500 rounded-xl hover:scale-[1.02] active:scale-[0.98]" data-testid="button-login">
                          Sign In
                        </Button>
                      )}
                    </div>

                    {isSignUp && (
                      <>
                        {/* Step 2: Password */}
                        <div className="w-full flex-shrink-0 space-y-4 px-4">
                          <div className="text-center mb-8 animate-fade-in">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 mb-4 border border-purple-500/20 backdrop-blur-sm" style={{ animation: 'float-gentle 3s ease-in-out infinite', animationDelay: '0.5s' }}>
                              <Lock className="h-12 w-12 text-purple-400" />
                            </div>
                            <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight" style={{ fontFamily: '"Inter", -apple-system, system-ui, sans-serif' }}>
                              Secure Your Account
                            </h3>
                            <p className="text-base text-gray-400 mt-3 font-medium">
                              Choose a strong, memorable password
                            </p>
                          </div>
                          
                          <div className="space-y-3">
                            <Label htmlFor="password" className="text-base font-semibold text-gray-300">Password</Label>
                            <Input
                              id="password"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Create a secure password"
                              required
                              autoFocus={currentStep === 2}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleNextStep();
                                }
                              }}
                              className="border-2 border-gray-700 bg-gray-800/50 text-gray-100 placeholder:text-gray-500 focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 text-lg py-6 rounded-xl"
                              data-testid="input-password"
                            />
                          </div>

                          <div className="flex gap-3 mt-8">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handlePrevStep}
                              className="flex-1 py-6 border-2 border-gray-700 bg-gray-800/50 hover:bg-gray-700/50 text-gray-200 hover:text-white hover:border-gray-600 transition-all duration-300 rounded-xl"
                              data-testid="button-back-step-2"
                            >
                              <ArrowLeft className="mr-2 h-5 w-5" />
                              Back
                            </Button>
                            <Button
                              type="button"
                              onClick={handleNextStep}
                              className="flex-1 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:via-pink-500 hover:to-rose-500 shadow-2xl shadow-purple-500/50 hover:shadow-pink-500/50 transition-all duration-500 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98]"
                              data-testid="button-next-step-2"
                            >
                              Continue
                              <ArrowRight className="ml-2 h-6 w-6" />
                            </Button>
                          </div>
                        </div>

                        {/* Step 3: Timezone */}
                        <div className="w-full flex-shrink-0 space-y-4 px-4">
                          <div className="text-center mb-8 animate-fade-in">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 mb-4 border border-cyan-500/20 backdrop-blur-sm" style={{ animation: 'float-gentle 3s ease-in-out infinite', animationDelay: '1s' }}>
                              <Globe className="h-12 w-12 text-cyan-400" />
                            </div>
                            <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent tracking-tight" style={{ fontFamily: '"Inter", -apple-system, system-ui, sans-serif' }}>
                              Select Your Timezone
                            </h3>
                            <p className="text-base text-gray-400 mt-3 font-medium">
                              We'll keep everything perfectly synchronized
                            </p>
                          </div>
                          
                          <div className="space-y-3">
                            <Label htmlFor="timezone" className="text-base font-semibold text-gray-300">Timezone</Label>
                            <Select value={timezone} onValueChange={setTimezone}>
                              <SelectTrigger className="border-2 border-gray-700 bg-gray-800/50 text-gray-100 py-6 rounded-xl focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-300" data-testid="select-timezone">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                {TIMEZONES.map((tz) => (
                                  <SelectItem key={tz} value={tz} className="text-gray-100 focus:bg-gray-700">
                                    {tz}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex gap-3 mt-8">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handlePrevStep}
                              className="flex-1 py-6 border-2 border-gray-700 bg-gray-800/50 hover:bg-gray-700/50 text-gray-200 hover:text-white hover:border-gray-600 transition-all duration-300 rounded-xl"
                              data-testid="button-back-step-3"
                            >
                              <ArrowLeft className="mr-2 h-5 w-5" />
                              Back
                            </Button>
                            <Button 
                              type="submit" 
                              className="flex-1 py-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 shadow-2xl shadow-cyan-500/50 hover:shadow-blue-500/50 transition-all duration-500 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98]" 
                              data-testid="button-signup"
                            >
                              Create Account ✨
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-5 border-t border-gray-700/50 mt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full hover:bg-blue-500/10 text-gray-300 hover:text-blue-300 font-semibold transition-all duration-300 py-6 rounded-lg"
                    onClick={isSignUp ? switchToLogin : switchToSignUp}
                    data-testid="button-toggle-mode"
                  >
                    {isSignUp ? 'Already have an account? Sign In →' : 'Need an account? Create One →'}
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
