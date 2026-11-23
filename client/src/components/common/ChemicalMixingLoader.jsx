import React, { useState, useEffect } from 'react';

export default function ChemicalMixingLoader({ 
  text = 'Mixing Reagents & Synchronizing Ledger...',
  subtext = 'Titrating biobank buffers and verifying cold-chain registry',
  size = 'default' // 'sm', 'default', 'lg'
}) {
  const [flavorTextIndex, setFlavorTextIndex] = useState(0);

  const flavorQuotes = [
    'Titrating biobank buffer solutions...',
    'Catalyzing sample transfer custody chain...',
    'Calibrating cryogenic temperature sensors...',
    'Synthesizing GLP-compliant audit signatures...',
    'Aligning 2D DataMatrix specimen indices...'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setFlavorTextIndex((prev) => (prev + 1) % flavorQuotes.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const scaleClass = size === 'sm' ? 'scale-75' : size === 'lg' ? 'scale-125' : 'scale-100';

  return (
    <div className="flex flex-col items-center justify-center p-8 select-none">
      {/* Chemical Mixing Glassware Animation Container */}
      <div className={`relative w-44 h-40 flex items-center justify-center ${scaleClass} transition-transform`}>
        {/* Glow Aura underneath */}
        <div className="absolute bottom-2 w-28 h-6 bg-red-500/20 rounded-full blur-md animate-pulse"></div>

        {/* SVG Laboratory Chemistry Rig */}
        <svg
          viewBox="0 0 200 160"
          className="w-full h-full drop-shadow-md overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Liquid Gradient */}
            <linearGradient id="reagentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>

            {/* Pouring Reagent Gradient (amber/gold catalyst) */}
            <linearGradient id="catalystGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Liquid clip path for flask body */}
            <clipPath id="flaskClip">
              <path d="M 88 50 L 72 118 C 70 128, 76 136, 88 136 L 128 136 C 140 136, 146 128, 144 118 L 128 50 Z" />
            </clipPath>
          </defs>

          <style>{`
            @keyframes tiltPour {
              0%, 100% {
                transform: rotate(-35deg) translate(28px, -15px);
              }
              50% {
                transform: rotate(-65deg) translate(14px, -22px);
              }
            }

            @keyframes dropFall {
              0% {
                cy: 42;
                opacity: 0;
                r: 2;
              }
              25% {
                opacity: 1;
                r: 3.5;
              }
              80% {
                cy: 98;
                opacity: 1;
                r: 3;
              }
              95%, 100% {
                cy: 104;
                opacity: 0;
                r: 5;
              }
            }

            @keyframes liquidSlosh {
              0%, 100% {
                transform: rotate(-4deg) translateY(0px);
              }
              50% {
                transform: rotate(5deg) translateY(-2px);
              }
            }

            @keyframes bubbleRise1 {
              0% {
                cy: 130;
                opacity: 0;
                r: 2;
              }
              30% {
                opacity: 0.8;
                r: 3;
              }
              90% {
                opacity: 0.8;
                cy: 94;
                r: 3.5;
              }
              100% {
                opacity: 0;
                cy: 90;
                r: 5;
              }
            }

            @keyframes bubbleRise2 {
              0% {
                cy: 128;
                opacity: 0;
                r: 2.5;
              }
              40% {
                opacity: 0.9;
                r: 4;
              }
              90% {
                opacity: 0.9;
                cy: 96;
                r: 4.5;
              }
              100% {
                opacity: 0;
                cy: 91;
                r: 6;
              }
            }

            @keyframes vaporFloat {
              0% {
                transform: translateY(0) scale(0.8);
                opacity: 0;
              }
              40% {
                opacity: 0.5;
              }
              100% {
                transform: translateY(-20px) scale(1.4);
                opacity: 0;
              }
            }

            .anim-pour-tube {
              transform-origin: 50px 30px;
              animation: tiltPour 3s ease-in-out infinite;
            }

            .anim-drop {
              animation: dropFall 1.5s cubic-bezier(0.45, 0, 0.75, 1) infinite;
            }

            .anim-liquid {
              transform-origin: 108px 115px;
              animation: liquidSlosh 3s ease-in-out infinite;
            }

            .anim-bubble-1 {
              animation: bubbleRise1 2s ease-in-out infinite;
            }

            .anim-bubble-2 {
              animation: bubbleRise2 2.4s ease-in-out infinite 0.6s;
            }

            .anim-bubble-3 {
              animation: bubbleRise1 1.8s ease-in-out infinite 1.1s;
            }

            .anim-vapor-1 {
              transform-origin: 108px 30px;
              animation: vaporFloat 2.5s ease-out infinite;
            }
            .anim-vapor-2 {
              transform-origin: 114px 28px;
              animation: vaporFloat 2.8s ease-out infinite 1.2s;
            }
          `}</style>

          {/* Effervescent Vapor Clouds */}
          <circle cx="104" cy="30" r="4" fill="#fb7185" className="anim-vapor-1" />
          <circle cx="112" cy="28" r="5" fill="#fda4af" className="anim-vapor-2" />

          {/* 1. MAIN ERLENMEYER FLASK GLASSWARE */}
          {/* Flask Shadow / Base Stand */}
          <ellipse cx="108" cy="138" rx="34" ry="4" fill="#e2e8f0" />

          {/* Liquid Inside Flask (Clipped to Flask Contour) */}
          <g clipPath="url(#flaskClip)">
            {/* Sloshing Reacting Liquid */}
            <g className="anim-liquid">
              <rect x="60" y="90" width="96" height="56" fill="url(#reagentGradient)" />
              {/* Swirling Color Wave Highlight */}
              <ellipse cx="108" cy="94" rx="28" ry="6" fill="#fb7185" opacity="0.6" />
              {/* Secondary mixing amber swirl */}
              <circle cx="106" cy="102" r="14" fill="#f59e0b" opacity="0.35" className="animate-pulse" />
            </g>

            {/* Rising Chemical Bubbles */}
            <circle cx="98" cy="120" r="3" fill="#ffffff" className="anim-bubble-1" />
            <circle cx="116" cy="122" r="3.5" fill="#ffffff" className="anim-bubble-2" />
            <circle cx="108" cy="118" r="2.5" fill="#fef08a" className="anim-bubble-3" />
            <circle cx="122" cy="124" r="2" fill="#ffffff" className="anim-bubble-1" style={{ animationDelay: '0.4s' }} />
          </g>

          {/* Flask Outer Glass Outline (Translucent laboratory borosilicate) */}
          {/* Flask Neck */}
          <rect x="100" y="24" width="16" height="30" rx="1" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
          {/* Flask Lip / Rim */}
          <ellipse cx="108" cy="24" rx="10" ry="2" fill="#f8fafc" stroke="#64748b" strokeWidth="2.5" />
          {/* Flask Body */}
          <path
            d="M 100 50 L 72 118 C 70 128, 76 136, 88 136 L 128 136 C 140 136, 146 128, 144 118 L 116 50"
            fill="none"
            stroke="#64748b"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Glass Specular Reflection Highlight */}
          <path
            d="M 78 122 L 98 62"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* Graduated Measurement Tick Marks on Flask */}
          <line x1="102" y1="80" x2="108" y2="80" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="99" y1="95" x2="108" y2="95" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="94" y1="110" x2="106" y2="110" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />

          {/* 2. FALLING REAGENT DROPLETS */}
          <circle cx="106" cy="42" r="3" fill="#f59e0b" className="anim-drop" />
          <circle cx="107" cy="42" r="2.5" fill="#f43f5e" className="anim-drop" style={{ animationDelay: '0.75s' }} />

          {/* 3. TILTED POURING TEST TUBE / PIPETTE */}
          <g className="anim-pour-tube">
            {/* Tube Body */}
            <rect x="25" y="16" width="46" height="11" rx="5" fill="#f8fafc" stroke="#64748b" strokeWidth="2" opacity="0.95" />
            {/* Liquid inside test tube */}
            <rect x="26" y="17.5" width="34" height="8" rx="4" fill="url(#catalystGradient)" />
            {/* Tube Rim */}
            <ellipse cx="71" cy="21.5" rx="2" ry="5.5" fill="#f59e0b" stroke="#64748b" strokeWidth="1.5" />
            {/* Glass reflection */}
            <line x1="32" y1="19" x2="62" y2="19" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
          </g>
        </svg>
      </div>

      {/* Primary Status Text */}
      <div className="mt-3 text-center space-y-1 max-w-sm">
        <h4 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center justify-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping mr-1"></span>
          <span>{text}</span>
        </h4>
        <p className="text-xs text-rose-600 font-semibold animate-fade-in font-mono h-4">
          {flavorQuotes[flavorTextIndex]}
        </p>
        <p className="text-[11px] text-slate-400">
          {subtext}
        </p>
      </div>
    </div>
  );
}
