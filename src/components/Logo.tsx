import React from 'react';
import { Banknote } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ className = '', showText = true, size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Simple modern financial logo */}
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <svg 
          className={`${sizeClasses[size]}`} 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="fedhaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          {/* F letter with modern styling */}
          <rect x="6" y="6" width="4" height="20" rx="2" fill="url(#fedhaGradient)" />
          <rect x="6" y="6" width="16" height="4" rx="2" fill="url(#fedhaGradient)" />
          <rect x="6" y="14" width="12" height="4" rx="2" fill="url(#fedhaGradient)" />
          {/* Small accent dot */}
          <circle cx="24" cy="24" r="2" fill="url(#fedhaGradient)" opacity="0.6" />
        </svg>
      </div>
      
      {showText && (
        <span className={`font-bold ${textSizeClasses[size]} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
          FedhaSmart
        </span>
      )}
    </div>
  );
};

// Alternative version if you have an SVG logo
export const LogoWithSVG = ({ className = '', showText = true, size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Replace this with your actual logo path */}
      <img 
        src="/src/assets/react.svg" // Update this path to your actual logo
        alt="FedhaSmart Logo" 
        className={`${sizeClasses[size]} object-contain`}
      />
      
      {showText && (
        <span className={`font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
          FedhaSmart
        </span>
      )}
    </div>
  );
};