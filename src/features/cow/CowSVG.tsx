import React from 'react';
import { MeatPart } from '../../types';
import { getPartAvailability, getPartColor } from '../../data/mockData';

interface CowSVGProps {
  parts: MeatPart[];
  selectedPartId: string | null;
  hoveredPartId: string | null;
  onPartClick: (part: MeatPart) => void;
  onPartHover: (partId: string | null) => void;
  pulsingPartId: string | null;
}

const CowSVG: React.FC<CowSVGProps> = ({
  parts,
  selectedPartId,
  hoveredPartId,
  onPartClick,
  onPartHover,
  pulsingPartId,
}) => {
  const getPartById = (id: string) => parts.find(p => p.id === id);

  const getFill = (partId: string) => {
    const part = getPartById(partId);
    if (!part) return '#4b5563';
    const pct = getPartAvailability(part);
    const isSelected = selectedPartId === partId || hoveredPartId === partId;
    return getPartColor(pct, isSelected);
  };

  const getGradientId = (partId: string) => `grad-${partId}`;

  const getOpacity = (partId: string) => {
    const part = getPartById(partId);
    if (!part) return 0.5;
    const pct = getPartAvailability(part);
    if (pct <= 0) return 0.35;
    if (hoveredPartId === partId) return 1;
    if (selectedPartId === partId) return 0.95;
    return 0.82;
  };

  const partStyle = (partId: string): React.CSSProperties => {
    const isHovered = hoveredPartId === partId;
    const isSelected = selectedPartId === partId;
    const isPulsing = pulsingPartId === partId;
    const part = getPartById(partId);
    const pct = part ? getPartAvailability(part) : 0;

    return {
      fill: `url(#${getGradientId(partId)})`,
      opacity: getOpacity(partId),
      cursor: pct <= 0 ? 'not-allowed' : 'pointer',
      transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      filter: isHovered
        ? 'drop-shadow(0 0 12px rgba(255,255,255,0.4)) brightness(1.2)'
        : isSelected
        ? 'drop-shadow(0 0 8px rgba(59,130,246,0.6))'
        : isPulsing
        ? 'drop-shadow(0 0 10px rgba(239,68,68,0.6)) brightness(1.1)'
        : 'none',
      stroke: isHovered ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)',
      strokeWidth: isHovered ? 2 : 1.2,
      strokeLinejoin: 'round' as const,
      animation: isPulsing ? 'svg-pulse 0.8s ease-in-out infinite' : 'none',
    };
  };

  const handleClick = (partId: string) => {
    const part = getPartById(partId);
    if (!part) return;
    if (getPartAvailability(part) <= 0) return;
    onPartClick(part);
  };

  // --- Improved realistic cow silhouette ---
  const cowSilhouette = `
    M 95,165
    C 85,148 72,130 68,115
    C 63,95 80,72 105,65
    C 118,58 125,32 140,18
    C 152,6 168,12 175,30
    C 178,18 190,8 205,15
    C 218,22 215,48 210,60
    C 225,55 250,65 270,80
    C 295,98 310,108 320,115
    C 400,118 550,122 700,120
    C 760,118 800,130 830,165
    C 850,190 845,240 840,280
    C 835,320 815,380 800,430
    C 792,460 785,500 782,535
    C 780,555 775,568 768,575
    L 730,575
    C 735,565 738,548 740,530
    C 743,500 738,460 725,420
    C 712,380 700,370 690,380
    C 640,420 560,440 480,435
    C 420,430 380,418 350,395
    C 345,420 340,460 335,500
    C 332,530 328,555 325,568
    L 280,568
    C 285,555 290,530 292,500
    C 295,460 290,410 275,370
    C 258,330 230,300 200,280
    C 170,260 140,240 115,220
    C 95,200 85,185 95,165 Z
  `;

  const tailPath = `
    M 838,180
    Q 860,200 855,260
    Q 852,300 865,340
    Q 870,350 862,345
    Q 848,320 850,260
    Q 852,200 825,170 Z
  `;

  // --- Anatomical cut paths (curved boundaries) ---
  const cutPaths: Record<string, string> = {
    // 10. Neck – front area
    neck: `
      M 0,0 L 230,0 
      Q 228,80 225,150 
      Q 218,250 210,320 
      Q 200,400 195,480 
      L 190,600 L 0,600 Z
    `,
    // 6. Mock Fillet – small top cut
    mock_fillet: `
      M 230,0 L 315,0 
      Q 312,60 308,120 
      Q 304,170 300,200 
      L 225,150 
      Q 228,80 230,0 Z
    `,
    // 5. Shoulder Roast – upper chuck
    shoulder_roast: `
      M 315,0 L 400,0 
      Q 398,60 395,120 
      L 395,200 
      Q 350,198 300,200 
      Q 304,170 308,120 
      Q 312,60 315,0 Z
    `,
    // 4. Shoulder Center – mid chuck  
    shoulder_center: `
      M 225,150 L 300,200 
      Q 350,198 395,200 
      Q 388,260 382,310
      Q 375,310 230,310
      Q 220,240 218,250
      Q 222,200 225,150 Z
    `,
    // 3. Brisket – lower front
    brisket: `
      M 218,250
      Q 220,240 230,310
      Q 375,310 382,310
      Q 378,370 370,420
      Q 360,430 200,420
      Q 205,370 210,320
      Q 215,285 218,250 Z
    `,
    // 8. Front Shank – front leg
    front_shank: `
      M 200,420
      Q 360,430 370,420
      Q 365,470 360,530
      L 355,600 L 190,600
      Q 195,520 195,480
      Q 198,450 200,420 Z
    `,
    // 1. Entrecote – prime rib eye
    entrecote: `
      M 400,0 L 520,0 
      Q 518,60 516,120 
      L 514,200 
      L 395,200 
      Q 398,120 400,0 Z
    `,
    // 7. Rib Cover – rib cap
    rib_cover: `
      M 395,200 L 514,200 
      Q 512,235 510,265 
      Q 500,263 392,265 
      Q 393,232 395,200 Z
    `,
    // 2. Ribs – rib section
    ribs: `
      M 392,265 
      Q 500,263 510,265 
      Q 506,300 502,345 
      Q 495,348 382,310 
      Q 386,288 392,265 Z
    `,
    // 9. Asado – short ribs / belly ribs
    asado: `
      M 382,310
      Q 495,348 502,345
      Q 498,400 492,460
      L 485,600 L 355,600
      Q 360,530 365,470
      Q 370,420 378,370
      Q 382,310 382,310 Z
    `,
    // 11. Sirloin – strip loin
    sirloin: `
      M 520,0 L 612,0 
      Q 610,60 608,120 
      L 606,200 
      L 514,200 
      Q 518,120 520,0 Z
    `,
    // 12. Fillet – tenderloin (small, premium)
    fillet: `
      M 514,200 L 606,200 
      Q 604,240 600,285 
      Q 560,275 510,265 
      Q 512,235 514,200 Z
    `,
    // 17. Flank – belly/flank
    flank: `
      M 510,265 
      Q 560,275 600,285
      Q 595,340 590,420
      L 585,600 L 485,600
      Q 492,460 498,400
      Q 502,345 506,300
      Q 508,280 510,265 Z
    `,
    // 13. Shaitel – rump steak
    shaitel: `
      M 612,0 L 718,0 
      Q 716,60 714,120 
      L 712,200 
      L 606,200 
      Q 608,120 612,0 Z
    `,
    // 16. Kaf – topside
    kaf: `
      M 718,0 L 870,0 
      L 870,200 
      L 712,200 
      Q 714,120 718,0 Z
    `,
    // 14. Avasit – silverside
    avasit: `
      M 606,200 L 712,200 
      Q 710,245 706,290 
      Q 655,288 600,285 
      Q 604,240 606,200 Z
    `,
    // 19. Weissbraten – eye of round
    weissbraten: `
      M 712,200 L 870,200 
      L 870,290 
      L 706,290 
      Q 710,245 712,200 Z
    `,
    // 15. Chach – outside meat
    chach: `
      M 600,285
      Q 655,288 706,290
      L 870,290
      L 870,420
      L 590,420
      Q 595,340 600,285 Z
    `,
    // 18. Rear Shank – hind leg
    rear_shank: `
      M 590,420 L 870,420 
      L 870,600 L 585,600 
      Q 590,500 590,420 Z
    `,
  };

  // Generate gradients for each part dynamically
  const renderGradients = () => {
    return parts.map(part => {
      const baseColor = getFill(part.id);
      // Create a gradient that goes from slightly lighter to base color
      return (
        <linearGradient
          key={`grad-${part.id}`}
          id={getGradientId(part.id)}
          x1="0%" y1="0%" x2="100%" y2="100%"
        >
          <stop offset="0%" stopColor={baseColor} stopOpacity={0.95} />
          <stop offset="50%" stopColor={baseColor} stopOpacity={1} />
          <stop offset="100%" stopColor={baseColor} stopOpacity={0.75} />
        </linearGradient>
      );
    });
  };

  const labelPos: Record<string, { x: number; y: number; num: string }> = {
    // Left side / front
    neck:            { x: 152, y: 210, num: '10' }, // moved right+up into visible neck body
    mock_fillet:     { x: 272, y: 120, num: '6'  },
    shoulder_roast:  { x: 355, y: 138, num: '5'  },
    shoulder_center: { x: 308, y: 248, num: '4'  },
    brisket:         { x: 295, y: 355, num: '3'  },
    front_shank:     { x: 308, y: 460, num: '8'  }, // front leg visible x≈275-355, y≈430-570
    // Middle
    entrecote:       { x: 458, y: 158, num: '1'  },
    rib_cover:       { x: 453, y: 233, num: '7'  },
    ribs:            { x: 448, y: 306, num: '2'  },
    asado:           { x: 432, y: 390, num: '9'  }, // moved up – belly visible only to ~y415
    // Right-middle
    sirloin:         { x: 563, y: 158, num: '11' },
    fillet:          { x: 558, y: 244, num: '12' },
    flank:           { x: 548, y: 385, num: '17' }, // moved up – same belly clip
    // Right
    shaitel:         { x: 663, y: 158, num: '13' },
    kaf:             { x: 790, y: 163, num: '16' },
    avasit:          { x: 658, y: 246, num: '14' },
    weissbraten:     { x: 786, y: 246, num: '19' },
    chach:           { x: 728, y: 350, num: '15' },
    rear_shank:      { x: 758, y: 478, num: '18' }, // rear leg visible x≈725-800, y≈420-575
  };

  return (
    <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
      <svg
        viewBox="-40 -20 950 640"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: 'auto', display: 'block' }}
        aria-label="פרה אינטראקטיבית"
      >
        <defs>
          {/* Cow silhouette clip path */}
          <clipPath id="cow-clip">
            <path d={cowSilhouette} />
          </clipPath>

          {/* Glow filter for hover */}
          <filter id="glow-hover" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feFlood floodColor="#ffffff" floodOpacity="0.3" result="glowColor" />
            <feComposite in="glowColor" in2="blur" operator="in" result="softGlow" />
            <feMerge>
              <feMergeNode in="softGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Subtle inner shadow for depth */}
          <filter id="inner-depth" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
            <feOffset dx="2" dy="2" result="offset" />
            <feComposite in="SourceGraphic" in2="offset" operator="over" />
          </filter>

          {/* Ambient background glow */}
          <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(139,92,246,0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Label background */}
          <filter id="label-bg" x="-10%" y="-10%" width="120%" height="120%">
            <feFlood floodColor="rgba(0,0,0,0.7)" result="bg" />
            <feGaussianBlur in="bg" stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Part gradients */}
          {renderGradients()}
        </defs>

        {/* Subtle background glow */}
        <ellipse cx="450" cy="300" rx="480" ry="320" fill="url(#bg-glow)" />

        {/* Tail */}
        <path d={tailPath} fill="#3b4555" opacity="0.5" />

        {/* Outer silhouette shadow */}
        <path
          d={cowSilhouette}
          fill="none"
          stroke="rgba(139,92,246,0.15)"
          strokeWidth="4"
          style={{ filter: 'blur(6px)' }}
        />

        {/* Background silhouette */}
        <path d={cowSilhouette} fill="#12121d" opacity="0.4" />

        {/* Interactive meat cuts clipped to cow shape */}
        <g clipPath="url(#cow-clip)">
          {Object.entries(cutPaths).map(([partId, pathData]) => {
            const part = getPartById(partId);
            if (!part) return null;
            return (
              <path
                key={partId}
                d={pathData}
                style={partStyle(partId)}
                onClick={() => handleClick(partId)}
                onMouseEnter={() => onPartHover(partId)}
                onMouseLeave={() => onPartHover(null)}
              />
            );
          })}
        </g>

        {/* Cow outline on top for clean edges */}
        <path
          d={cowSilhouette}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Labels */}
        {parts.map(part => {
          const pos = labelPos[part.id];
          if (!pos) return null;
          const isHovered = hoveredPartId === part.id;
          const pct = getPartAvailability(part);
          const isSold = pct <= 0;

          return (
            <g
              key={`label-${part.id}`}
              style={{
                pointerEvents: 'none',
                opacity: isSold ? 0.4 : isHovered ? 1 : 0.85,
                transition: 'opacity 0.3s',
              }}
            >
              {/* Label background pill */}
              <rect
                x={pos.x - 28}
                y={pos.y - 24}
                width={56}
                height={38}
                rx={8}
                fill={isHovered ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)'}
                stroke={isHovered ? 'rgba(255,255,255,0.3)' : 'none'}
                strokeWidth={0.5}
                style={{ transition: 'all 0.3s' }}
              />
              {/* Number */}
              <text
                x={pos.x} y={pos.y - 7}
                textAnchor="middle"
                fill="white"
                fontSize={isHovered ? '16' : '14'}
                fontFamily="Heebo, sans-serif"
                fontWeight="900"
                style={{ transition: 'font-size 0.3s' }}
              >
                {pos.num}
              </text>
              {/* Name */}
              <text
                x={pos.x} y={pos.y + 10}
                textAnchor="middle"
                fill={isHovered ? 'white' : 'rgba(255,255,255,0.85)'}
                fontSize={isHovered ? '11' : '10'}
                fontFamily="Heebo, sans-serif"
                fontWeight="600"
                style={{ transition: 'all 0.3s' }}
              >
                {part.nameHe}
              </text>
            </g>
          );
        })}

        {/* Pulsing indicator dots for low-stock parts */}
        {parts.filter(p => {
          const pct = getPartAvailability(p);
          return pct > 0 && pct < 15;
        }).map(part => {
          const pos = labelPos[part.id];
          if (!pos) return null;
          return (
            <g key={`pulse-${part.id}`} style={{ pointerEvents: 'none' }}>
              <circle
                cx={pos.x + 28}
                cy={pos.y - 20}
                r="4"
                fill="#ef4444"
              >
                <animate
                  attributeName="r"
                  values="3;6;3"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="1;0.3;1"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}
      </svg>

      {/* CSS keyframe for pulse animation */}
      <style>{`
        @keyframes svg-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
};

export default React.memo(CowSVG);
