import React from 'react';

export default function GoogleGeminiLogo({ className = "w-5 h-5", showText = false, textClassName = "text-sm font-semibold" }) {
  const rawId = React.useId();
  const gradientId = 'gemini-grad-' + rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  const svgIcon = (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Google Gemini Pro Logo"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="35%" stopColor="#9B72CF" />
          <stop offset="70%" stopColor="#D96570" />
          <stop offset="100%" stopColor="#F2994A" />
        </linearGradient>
      </defs>
      {/* Main Gemini Star */}
      <path
        d="M11.5 22C11.5 16.75 7.25 12.5 2 12.5C7.25 12.5 11.5 8.25 11.5 3C11.5 8.25 15.75 12.5 21 12.5C15.75 12.5 11.5 16.75 11.5 22Z"
        fill={`url(#${gradientId})`}
      />
      {/* Secondary Sparkle Star */}
      <path
        d="M19 7C19 5.34 17.66 4 16 4C17.66 4 19 2.66 19 1C19 2.66 20.34 4 22 4C20.34 4 19 5.34 19 7Z"
        fill={`url(#${gradientId})`}
        opacity="0.85"
      />
    </svg>
  );

  if (!showText) {
    return svgIcon;
  }

  return (
    <span className="inline-flex items-center gap-1.5 align-middle select-none">
      {svgIcon}
      <span className={textClassName}>
        <span className="text-foreground">Google </span>
        <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-bold">
          Gemini Pro
        </span>
      </span>
    </span>
  );
}
