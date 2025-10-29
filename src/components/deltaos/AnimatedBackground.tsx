import { useEffect, useState } from 'react';

interface AnimatedBackgroundProps {
  themeMode: 'dark' | 'light';
  customBackgroundImage?: string;
  customBackgroundColor?: string;
}

export const AnimatedBackground = ({ 
  themeMode, 
  customBackgroundImage,
  customBackgroundColor 
}: AnimatedBackgroundProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number }>>([]);
  const [typedText, setTypedText] = useState('');
  const fullText = 'Welcome to Delta OS';

  useEffect(() => {
    const particleCount = 20; // Reduced for better performance on lower-end devices
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 25 + 15,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    if (customBackgroundImage) {
      setTypedText('');
      return;
    }

    let index = 0;
    let isDeleting = false;
    let pauseCounter = 0;
    setTypedText('');
    
    const typingInterval = setInterval(() => {
      if (pauseCounter > 0) {
        pauseCounter--;
        return;
      }

      if (!isDeleting) {
        // Typing phase
        if (index < fullText.length) {
          setTypedText(fullText.substring(0, index + 1));
          index++;
        } else {
          // Pause before deleting (2 seconds = 20 intervals at 100ms)
          pauseCounter = 20;
          isDeleting = true;
        }
      } else {
        // Deleting phase
        if (index > 0) {
          index--;
          setTypedText(fullText.substring(0, index));
        } else {
          // Pause before typing again (1 second = 10 intervals at 100ms)
          pauseCounter = 10;
          isDeleting = false;
        }
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [customBackgroundImage]);

  const isDark = themeMode === 'dark';

  if (customBackgroundImage) {
    return (
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${customBackgroundImage})` }}
      />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: customBackgroundColor || (isDark
            ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%)'
            : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 25%, #93c5fd 50%, #bfdbfe 75%, #dbeafe 100%)'),
          animation: 'gradient-shift 15s ease infinite',
          backgroundSize: '400% 400%',
        }}
      />

      {/* Animated gradient orbs - optimized for performance */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-xl opacity-30"
          style={{
            background: isDark 
              ? 'radial-gradient(circle, #3b82f6 0%, transparent 70%)'
              : 'radial-gradient(circle, #60a5fa 0%, transparent 70%)',
            animation: 'float-1 25s ease-in-out infinite',
            willChange: 'transform',
          }}
        />
        <div 
          className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full blur-xl opacity-25"
          style={{
            background: isDark
              ? 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)'
              : 'radial-gradient(circle, #a78bfa 0%, transparent 70%)',
            animation: 'float-2 30s ease-in-out infinite',
            willChange: 'transform',
          }}
        />
        <div 
          className="absolute bottom-0 left-1/4 w-[550px] h-[550px] rounded-full blur-xl opacity-25"
          style={{
            background: isDark
              ? 'radial-gradient(circle, #06b6d4 0%, transparent 70%)'
              : 'radial-gradient(circle, #22d3ee 0%, transparent 70%)',
            animation: 'float-3 35s ease-in-out infinite',
            willChange: 'transform',
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: isDark
                ? 'rgba(255, 255, 255, 0.3)'
                : 'rgba(255, 255, 255, 0.6)',
              animation: `float-particle ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
              boxShadow: isDark
                ? '0 0 10px rgba(255, 255, 255, 0.2)'
                : '0 0 10px rgba(255, 255, 255, 0.4)',
            }}
          />
        ))}
      </div>

      {/* Subtle grid overlay for tech feel */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px),
            linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%)',
        }}
      />

      {/* Welcome Text Animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h1 
          className={`text-6xl font-bold bg-gradient-to-r ${
            isDark 
              ? 'from-cyan-400 via-blue-400 to-purple-400' 
              : 'from-cyan-600 via-blue-600 to-purple-600'
          } bg-clip-text text-transparent drop-shadow-2xl`}
          style={{
            textShadow: isDark 
              ? '0 0 40px rgba(59, 130, 246, 0.5), 0 0 80px rgba(147, 51, 234, 0.3)' 
              : '0 0 40px rgba(59, 130, 246, 0.3), 0 0 80px rgba(147, 51, 234, 0.2)',
          }}
          data-testid="text-welcome"
        >
          {typedText}
          <span className="animate-pulse">|</span>
        </h1>
      </div>
    </div>
  );
};
