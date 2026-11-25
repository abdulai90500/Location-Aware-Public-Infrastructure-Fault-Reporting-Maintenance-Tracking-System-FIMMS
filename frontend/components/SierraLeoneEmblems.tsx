import React from "react";

export function SierraLeoneCoatOfArms({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Official Coat of Arms of the Republic of Sierra Leone"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="slGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1EB53A" />
          <stop offset="100%" stopColor="#0B7A23" />
        </linearGradient>
        <linearGradient id="slBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0072C6" />
          <stop offset="100%" stopColor="#004880" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5D061" />
          <stop offset="50%" stopColor="#D4A017" />
          <stop offset="100%" stopColor="#996515" />
        </linearGradient>
        <filter id="slShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Outer Halo / Sunburst */}
      <circle cx="200" cy="180" r="160" fill="url(#goldGrad)" opacity="0.12" />

      {/* Palm Trees on Sides */}
      {/* Left Palm Tree */}
      <g transform="translate(45, 90)">
        <path d="M 40 180 Q 30 110 38 60 Q 42 110 44 180 Z" fill="#8B5A2B" />
        {/* Palm fronds */}
        <path d="M 38 60 Q 10 30 -5 50 Q 20 40 38 60 Z" fill="#1EB53A" />
        <path d="M 38 60 Q 15 10 3 15 Q 25 25 38 60 Z" fill="#148028" />
        <path d="M 38 60 Q 40 0 50 15 Q 44 35 38 60 Z" fill="#1EB53A" />
        <path d="M 38 60 Q 60 20 75 35 Q 55 45 38 60 Z" fill="#148028" />
      </g>
      {/* Right Palm Tree */}
      <g transform="translate(275, 90)">
        <path d="M 40 180 Q 48 110 42 60 Q 38 110 36 180 Z" fill="#8B5A2B" />
        {/* Palm fronds */}
        <path d="M 42 60 Q 70 30 85 50 Q 60 40 42 60 Z" fill="#1EB53A" />
        <path d="M 42 60 Q 65 10 77 15 Q 55 25 42 60 Z" fill="#148028" />
        <path d="M 42 60 Q 40 0 30 15 Q 36 35 42 60 Z" fill="#1EB53A" />
        <path d="M 42 60 Q 20 20 5 35 Q 25 45 42 60 Z" fill="#148028" />
      </g>

      {/* Left Supporter Lion */}
      <g transform="translate(60, 110)" filter="url(#slShadow)">
        {/* Body & Hind Leg */}
        <path d="M 40 130 C 30 100 45 70 55 60 C 50 50 45 40 50 30 C 55 20 65 20 70 30 C 75 38 72 48 78 55 C 85 62 90 75 88 90 C 85 110 75 135 70 145 C 55 145 45 140 40 130 Z" fill="url(#goldGrad)" />
        {/* Tail */}
        <path d="M 40 120 C 20 120 10 90 15 70 C 18 60 25 65 22 75 C 18 90 28 105 38 110 Z" fill="url(#goldGrad)" />
        <circle cx="15" cy="68" r="6" fill="url(#goldGrad)" />
        {/* Front Paw reaching towards shield */}
        <path d="M 70 65 Q 95 60 102 70 Q 90 75 75 75 Z" fill="url(#goldGrad)" />
        {/* Eye & Mouth */}
        <circle cx="58" cy="32" r="2.5" fill="#5A3A00" />
        <path d="M 52 40 Q 60 42 64 38" stroke="#5A3A00" strokeWidth="1.5" />
      </g>

      {/* Right Supporter Lion */}
      <g transform="translate(255, 110) scale(-1, 1)" filter="url(#slShadow)">
        {/* Body & Hind Leg */}
        <path d="M -40 130 C -30 100 -45 70 -55 60 C -50 50 -45 40 -50 30 C -55 20 -65 20 -70 30 C -75 38 -72 48 -78 55 C -85 62 -90 75 -88 90 C -85 110 -75 135 -70 145 C -55 145 -45 140 -40 130 Z" fill="url(#goldGrad)" />
        {/* Tail */}
        <path d="M -40 120 C -20 120 -10 90 -15 70 C -18 60 -25 65 -22 75 C -18 90 -28 105 -38 110 Z" fill="url(#goldGrad)" />
        <circle cx="-15" cy="68" r="6" fill="url(#goldGrad)" />
        {/* Front Paw reaching towards shield */}
        <path d="M -70 65 Q -95 60 -102 70 Q -90 75 -75 75 Z" fill="url(#goldGrad)" />
        {/* Eye & Mouth */}
        <circle cx="-58" cy="32" r="2.5" fill="#5A3A00" />
        <path d="M -52 40 Q -60 42 -64 38" stroke="#5A3A00" strokeWidth="1.5" />
      </g>

      {/* Central Escutcheon / Shield */}
      <g filter="url(#slShadow)">
        {/* Shield Outer Gold Rim */}
        <path
          d="M 130 90 L 270 90 C 270 170 260 215 200 255 C 140 215 130 170 130 90 Z"
          fill="url(#goldGrad)"
          stroke="#7A5210"
          strokeWidth="3"
        />

        {/* Shield Inner Inset */}
        <path
          d="M 136 96 L 264 96 C 264 168 254 209 200 247 C 146 209 136 168 136 96 Z"
          fill="#FFFFFF"
        />

        {/* Upper Chief: White with Three Gold Torches */}
        <path d="M 136 96 L 264 96 L 264 140 L 136 140 Z" fill="#FFFFFF" />
        {/* 3 Flaming Torches */}
        {[-38, 0, 38].map((offset, i) => (
          <g key={i} transform={`translate(${200 + offset}, 118)`}>
            {/* Torch handle */}
            <path d="M -3 3 L 3 3 L 2 16 L -2 16 Z" fill="url(#goldGrad)" stroke="#5A3A00" strokeWidth="0.8" />
            {/* Torch bowl */}
            <path d="M -6 3 Q 0 5 6 3 L 4 -2 L -4 -2 Z" fill="url(#goldGrad)" stroke="#5A3A00" strokeWidth="0.8" />
            {/* Red & Gold Flame */}
            <path d="M 0 -13 Q 5 -7 3 -2 Q 0 -1 -3 -2 Q -5 -7 0 -13 Z" fill="#EF4444" />
            <path d="M 0 -10 Q 3 -6 2 -2 Q 0 -1 -2 -2 Q -3 -6 0 -10 Z" fill="#FBBF24" />
          </g>
        ))}

        {/* Serrated Division (Dancetty line) */}
        <path
          d="M 136 140 L 152 147 L 168 140 L 184 147 L 200 140 L 216 147 L 232 140 L 248 147 L 264 140 L 264 185 C 264 195 260 205 254 214 L 146 214 C 140 205 136 195 136 185 Z"
          fill="#FFFFFF"
        />

        {/* Lion Passant in Middle */}
        <g transform="translate(162, 148)">
          <path
            d="M 12 28 C 15 18 25 15 32 12 C 40 10 52 12 60 18 C 65 22 68 30 65 35 C 60 40 50 38 45 36 C 40 38 35 42 28 42 C 22 42 16 38 12 28 Z"
            fill="url(#goldGrad)"
          />
          {/* Lion Head */}
          <circle cx="68" cy="20" r="10" fill="url(#goldGrad)" />
          <path d="M 72 16 Q 78 20 74 24" stroke="#7A5210" strokeWidth="1.5" fill="none" />
          {/* Mane */}
          <path d="M 60 12 C 65 6 75 8 80 16 C 82 22 78 28 72 32 C 66 30 62 25 60 12 Z" fill="#B48218" opacity="0.8" />
          {/* Paws */}
          <path d="M 28 38 L 26 50 L 32 50 L 33 40" stroke="url(#goldGrad)" strokeWidth="3" strokeLinecap="round" />
          <path d="M 40 36 L 42 49 L 47 49 L 45 37" stroke="url(#goldGrad)" strokeWidth="3" strokeLinecap="round" />
          <path d="M 55 34 L 58 48 L 64 48 L 60 33" stroke="url(#goldGrad)" strokeWidth="3" strokeLinecap="round" />
          <path d="M 65 30 L 72 40 L 78 39 L 70 28" stroke="url(#goldGrad)" strokeWidth="3" strokeLinecap="round" />
          {/* Tail curling back */}
          <path d="M 14 26 Q 5 18 8 10 Q 14 10 12 16" stroke="url(#goldGrad)" strokeWidth="2.5" fill="none" />
          <circle cx="8" cy="10" r="3.5" fill="url(#goldGrad)" />
        </g>

        {/* Lower Base: Green Hills & Blue Waves */}
        <path
          d="M 136 195 L 264 195 C 264 205 254 225 200 247 C 146 225 136 205 136 195 Z"
          fill="url(#slGreenGrad)"
        />
        {/* Blue Water Stripes at Bottom */}
        <path
          d="M 155 228 C 170 236 185 242 200 247 C 215 242 230 236 245 228 C 235 240 218 246 200 247 C 182 246 165 240 155 228 Z"
          fill="url(#slBlueGrad)"
        />
        <path
          d="M 168 238 C 180 242 190 245 200 247 C 210 245 220 242 232 238 C 222 244 212 247 200 247 C 188 247 178 244 168 238 Z"
          fill="#FFFFFF"
          opacity="0.8"
        />
      </g>

      {/* Motto Ribbon at Bottom: "UNITY • FREEDOM • JUSTICE" */}
      <g transform="translate(200, 290)" filter="url(#slShadow)">
        {/* Ribbon Banner */}
        <path
          d="M -150 10 Q -90 0 0 0 Q 90 0 150 10 L 140 32 Q 90 22 0 22 Q -90 22 -140 32 Z"
          fill="#FAF8F0"
          stroke="#D4A017"
          strokeWidth="2"
        />
        {/* Ribbon Fold Ends */}
        <path d="M -150 10 L -175 -2 L -165 18 L -140 32 Z" fill="#E8DEC4" stroke="#D4A017" strokeWidth="1.5" />
        <path d="M 150 10 L 175 -2 L 165 18 L 140 32 Z" fill="#E8DEC4" stroke="#D4A017" strokeWidth="1.5" />

        {/* Motto Text */}
        <text
          x="0"
          y="15"
          textAnchor="middle"
          fontSize="11"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="2.5"
          fill="#1E293B"
        >
          UNITY • FREEDOM • JUSTICE
        </text>
      </g>

      {/* National Flag Bar Accent Below Ribbon */}
      <g transform="translate(110, 335)">
        <rect x="0" y="0" width="60" height="6" rx="3" fill="#1EB53A" />
        <rect x="60" y="0" width="60" height="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
        <rect x="120" y="0" width="60" height="6" rx="3" fill="#0072C6" />
      </g>
    </svg>
  );
}

export function SierraLeoneArmyLogo({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Republic of Sierra Leone Armed Forces (RSLAF) Official Emblem"
    >
      <defs>
        <linearGradient id="armyGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#CA8A04" />
          <stop offset="100%" stopColor="#854D0E" />
        </linearGradient>
        <linearGradient id="armyGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#15803D" />
          <stop offset="100%" stopColor="#052E16" />
        </linearGradient>
        <linearGradient id="armySteel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <filter id="armyDrop" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Outer Wreath of Laurel Leaves */}
      <g filter="url(#armyDrop)">
        <circle cx="200" cy="200" r="175" fill="#052E16" stroke="url(#armyGold)" strokeWidth="6" />
        <circle cx="200" cy="200" r="162" fill="none" stroke="url(#armyGold)" strokeWidth="2" strokeDasharray="4 4" />
      </g>

      {/* Flag Tricolor Rays */}
      <g opacity="0.25">
        <path d="M 200 200 L 70 70 A 175 175 0 0 1 330 70 Z" fill="#1EB53A" />
        <path d="M 200 200 L 330 70 A 175 175 0 0 1 330 330 Z" fill="#FFFFFF" />
        <path d="M 200 200 L 330 330 A 175 175 0 0 1 70 330 Z" fill="#0072C6" />
      </g>

      {/* Crossed Officer Swords */}
      <g filter="url(#armyDrop)">
        {/* Sword 1: Top-Left to Bottom-Right */}
        <g transform="rotate(45 200 200)">
          {/* Blade */}
          <path d="M 197 50 L 200 35 L 203 50 L 202 280 L 198 280 Z" fill="url(#armySteel)" stroke="#334155" strokeWidth="1" />
          <line x1="200" y1="40" x2="200" y2="280" stroke="#CBD5E1" strokeWidth="1.5" />
          {/* Crossguard */}
          <rect x="175" y="280" width="50" height="8" rx="3" fill="url(#armyGold)" stroke="#713F12" strokeWidth="1" />
          <circle cx="177" cy="284" r="4" fill="url(#armyGold)" />
          <circle cx="223" cy="284" r="4" fill="url(#armyGold)" />
          {/* Grip */}
          <rect x="195" y="288" width="10" height="36" rx="2" fill="#78350F" />
          {/* Pommel */}
          <circle cx="200" cy="330" r="8" fill="url(#armyGold)" stroke="#713F12" strokeWidth="1" />
        </g>

        {/* Sword 2: Top-Right to Bottom-Left */}
        <g transform="rotate(-45 200 200)">
          {/* Blade */}
          <path d="M 197 50 L 200 35 L 203 50 L 202 280 L 198 280 Z" fill="url(#armySteel)" stroke="#334155" strokeWidth="1" />
          <line x1="200" y1="40" x2="200" y2="280" stroke="#CBD5E1" strokeWidth="1.5" />
          {/* Crossguard */}
          <rect x="175" y="280" width="50" height="8" rx="3" fill="url(#armyGold)" stroke="#713F12" strokeWidth="1" />
          <circle cx="177" cy="284" r="4" fill="url(#armyGold)" />
          <circle cx="223" cy="284" r="4" fill="url(#armyGold)" />
          {/* Grip */}
          <rect x="195" y="288" width="10" height="36" rx="2" fill="#78350F" />
          {/* Pommel */}
          <circle cx="200" cy="330" r="8" fill="url(#armyGold)" stroke="#713F12" strokeWidth="1" />
        </g>
      </g>

      {/* Central Shield with Tricolor & Lion */}
      <g filter="url(#armyDrop)">
        <path
          d="M 150 140 L 250 140 C 250 205 240 235 200 265 C 160 235 150 205 150 140 Z"
          fill="#0F172A"
          stroke="url(#armyGold)"
          strokeWidth="4"
        />

        {/* National Tricolor Diagonal Stripes inside Shield */}
        <clipPath id="armyShieldClip">
          <path d="M 152 142 L 248 142 C 248 203 238 233 200 261 C 162 233 152 203 152 142 Z" />
        </clipPath>
        <g clipPath="url(#armyShieldClip)">
          <rect x="140" y="140" width="120" height="40" fill="#1EB53A" />
          <rect x="140" y="180" width="120" height="40" fill="#FFFFFF" />
          <rect x="140" y="220" width="120" height="50" fill="#0072C6" />

          {/* Central Gold Military Star */}
          <g transform="translate(200, 200)">
            <polygon
              points="0,-24 7,-7 24,-7 10,4 15,21 0,11 -15,21 -10,4 -24,-7 -7,-7"
              fill="url(#armyGold)"
              stroke="#713F12"
              strokeWidth="1.5"
            />
            <circle cx="0" cy="0" r="5" fill="#DC2626" />
          </g>
        </g>
      </g>

      {/* Circular Text Ring: REPUBLIC OF SIERRA LEONE ARMED FORCES */}
      <defs>
        <path id="armyTextArcTop" d="M 65 200 A 135 135 0 0 1 335 200" />
        <path id="armyTextArcBottom" d="M 335 200 A 135 135 0 0 1 65 200" />
      </defs>
      <text fill="url(#armyGold)" fontSize="13.5" fontWeight="900" letterSpacing="3.5" fontFamily="sans-serif">
        <textPath href="#armyTextArcTop" startOffset="50%" textAnchor="middle">
          SIERRA LEONE ARMED FORCES
        </textPath>
      </text>
      <text fill="#FFFFFF" fontSize="11" fontWeight="800" letterSpacing="4" fontFamily="sans-serif">
        <textPath href="#armyTextArcBottom" startOffset="50%" textAnchor="middle">
          HONOUR • DUTY • LOYALTY
        </textPath>
      </text>

      {/* RSLAF Bottom Ribbon */}
      <g transform="translate(200, 340)" filter="url(#armyDrop)">
        <rect x="-85" y="-12" width="170" height="24" rx="12" fill="#15803D" stroke="url(#armyGold)" strokeWidth="2" />
        <text
          x="0"
          y="4"
          textAnchor="middle"
          fontSize="11"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          letterSpacing="3"
          fill="#FFFFFF"
        >
          RSLAF • TASKFORCE
        </text>
      </g>
    </svg>
  );
}
