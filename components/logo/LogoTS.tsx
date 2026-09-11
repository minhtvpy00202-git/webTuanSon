import React from 'react';

export default function LogoTS({ className = "w-32 h-auto text-[var(--foreground)]" }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 160 80" 
      className={className}
    >
      {/* Cụm chữ TS Vững chãi */}
      <text 
        x="0" 
        y="65" 
        fontFamily="ui-sans-serif, system-ui, sans-serif" 
        fontWeight="900" 
        fontSize="72" 
        letterSpacing="-2"
        fill="currentColor"
      >
        TS
      </text>

      {/* Cụm Ngôi nhà đang xây (Lộ khung) */}
      <g transform="translate(100, 18)" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Mái nhà trái (Đã lợp kiên cố) */}
        <path d="M 16 2 L 0 16" strokeWidth="4" />
        
        {/* Mái nhà phải (Mới lên khung xà gồ) */}
        <path d="M 16 2 L 32 14" strokeWidth="2" strokeDasharray="4 2" />
        
        {/* Cột chống mái */}
        <path d="M 24 8 L 24 16" strokeWidth="1.5" /> 

        {/* Trụ chính bên trái */}
        <path d="M 4 14 L 4 34" strokeWidth="3" />
        
        {/* Trụ chính giữa */}
        <path d="M 16 2 L 16 34" strokeWidth="2" />
        
        {/* Trụ bên phải (Đang đổ cột dở dang) */}
        <path d="M 28 16 L 28 26" strokeWidth="1.5" />

        {/* Đà ngang tầng 1 */}
        <path d="M 4 22 L 32 22" strokeWidth="2" />
        
        {/* Đà ngang nền móng */}
        <path d="M 0 34 L 34 34" strokeWidth="3" />

        {/* Dàn giáo chữ X bên phải */}
        <path d="M 16 22 L 28 34" strokeWidth="1.5" opacity="0.7" />
        <path d="M 28 22 L 16 34" strokeWidth="1.5" opacity="0.7" />
      </g>
    </svg>
  );
}