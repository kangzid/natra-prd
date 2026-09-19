import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 32 }) => {
  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outer concentric rounded blue loop */}
        <circle
          cx="18"
          cy="18"
          r="15"
          stroke="#1d4ed8"
          strokeWidth="3.5"
          className="dark:stroke-[#38bdf8]"
        />
        {/* Inner concentric blue circle */}
        <circle
          cx="18"
          cy="18"
          r="8.5"
          stroke="#1d4ed8"
          strokeWidth="3.5"
          className="dark:stroke-[#38bdf8]"
        />
        {/* Center accent dot */}
        <circle
          cx="18"
          cy="18"
          r="3"
          fill="#1d4ed8"
          className="dark:fill-[#60a5fa]"
        />
      </svg>
    </div>
  );
};
