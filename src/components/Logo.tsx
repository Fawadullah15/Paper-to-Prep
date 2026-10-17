import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-9 h-9', size = 36 }) => {
  return (
    <div 
      className={`relative rounded-xl flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105 shadow-sm shadow-[#6259E8]/30 ${className}`}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #493DCE 0%, #6259E8 50%, #7B72F4 100%)',
      }}
    >
      {/* Background geometric grid overlay */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-1"
      >
        <defs>
          <linearGradient id="foldGrad" x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="0.5" stopColor="#E0DEEF" stopOpacity="0.8" />
            <stop offset="1" stopColor="#C4C0FF" stopOpacity="0.9" />
          </linearGradient>
          
          <linearGradient id="nodeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#F4F0FF" />
            <stop offset="1" stopColor="#FFFFFF" />
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Dynamic Paper Sheet Polygon Silhouette */}
        <path
          d="M10 8C10 6.89543 10.8954 6 12 6H24L31 13V31C31 32.1046 30.1046 33 29 33H12C10.8954 33 10 32.1046 10 31V8Z"
          fill="url(#foldGrad)"
          fillOpacity="0.18"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="1.2"
        />

        {/* Origami Top-Right Corner Fold */}
        <path
          d="M24 6V12C24 12.5523 24.4477 13 25 13H31L24 6Z"
          fill="#FFFFFF"
          fillOpacity="0.35"
        />

        {/* Knowledge Constellation Graph Network overlay */}
        {/* Connection links */}
        <line x1="15" y1="26" x2="21" y2="17" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.85" strokeDasharray="0" />
        <line x1="21" y1="17" x2="27" y2="24" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.85" />
        <line x1="15" y1="26" x2="27" y2="24" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.5" strokeDasharray="1.5 1.5" />

        {/* Constellation Nodes */}
        {/* Central Core Idea Node */}
        <circle cx="21" cy="17" r="3.2" fill="url(#nodeGrad)" filter="url(#glow)" />
        <circle cx="21" cy="17" r="1.4" fill="#493DCE" />

        {/* Synthesis Leaf Node 1 */}
        <circle cx="15" cy="26" r="2.4" fill="#FFFFFF" />
        <circle cx="15" cy="26" r="1" fill="#6259E8" />

        {/* Synthesis Leaf Node 2 */}
        <circle cx="27" cy="24" r="2.4" fill="#FFFFFF" />
        <circle cx="27" cy="24" r="1" fill="#6259E8" />

        {/* Active pulse aura */}
        <circle cx="21" cy="17" r="5" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="0.8" />
      </svg>
    </div>
  );
};
