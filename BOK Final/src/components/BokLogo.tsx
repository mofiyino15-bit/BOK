import React from "react";

interface BokLogoProps {
  className?: string;
  size?: number; // width of the SVG in pixels
}

export default function BokLogo({ className = "", size = 32 }: BokLogoProps) {
  // SVG representing the Bok brand logo: a vertical book with a solid dark spine
  // and ledger/grid line markings on the white right page surface.
  const height = Math.round((size * 5) / 4); // 4:5 aspect ratio

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 80 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none shrink-0 ${className}`}
    >
      {/* Dark spine - solid rounded rectangle with left-aligned branding color #17181A */}
      <rect x="0" y="0" width="16" height="100" rx="8" fill="#17181A" />
      
      {/* Book pages - right-anchored white panel with a dark outline */}
      <rect x="18" y="1.25" width="60.75" height="97.5" rx="8.5" fill="#FFFFFF" stroke="#17181A" strokeWidth="2.5" />
      
      {/* Ledger Vertical gridline intersecting columns */}
      <line x1="54.5" y1="13" x2="54.5" y2="87" stroke="#17181A" strokeWidth="1.5" />
      
      {/* 5 Ledger Horizontal gridlines intersecting rows */}
      <line x1="26" y1="23.5" x2="72" y2="23.5" stroke="#17181A" strokeWidth="1.5" />
      <line x1="26" y1="36" x2="72" y2="36" stroke="#17181A" strokeWidth="1.5" />
      <line x1="26" y1="48.5" x2="72" y2="48.5" stroke="#17181A" strokeWidth="1.5" />
      <line x1="26" y1="61" x2="72" y2="61" stroke="#17181A" strokeWidth="1.5" />
      <line x1="26" y1="73.5" x2="72" y2="73.5" stroke="#17181A" strokeWidth="1.5" />
    </svg>
  );
}
