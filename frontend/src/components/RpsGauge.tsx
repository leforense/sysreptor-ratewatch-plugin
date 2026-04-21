import React from 'react';

interface RpsGaugeProps {
  value: number;
}

export const RpsGauge: React.FC<RpsGaugeProps> = ({ value }) => {
  // Config
  // Determine max value for the gauge (next multiple of 50 or 100)
  const maxVal = Math.max(100, Math.ceil(value / 50) * 50);
  
  // Calculate percentage (0 to 1)
  const percentage = Math.min(value / maxVal, 1);
  
  // Rotation: -90deg (0%) to 90deg (100%)
  const rotation = -90 + (percentage * 180);

  // Color logic
  let colorClass = "text-emerald-500";
  let strokeColor = "#10b981"; // emerald-500
  if (value > 20) { colorClass = "text-yellow-500"; strokeColor = "#eab308"; } // yellow-500
  if (value > 50) { colorClass = "text-orange-500"; strokeColor = "#f97316"; } // orange-500
  if (value > 100) { colorClass = "text-red-500"; strokeColor = "#ef4444"; } // red-500

  // Ticks generation
  const ticks = [0, maxVal * 0.33, maxVal * 0.66, maxVal];
  
  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full">
      {/* Gauge Container */}
      <div className="relative w-64 h-32 overflow-hidden flex items-end justify-center">
        
        {/* SVG Gauge */}
        <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
            {/* Defs for gradients or filters if needed */}
            <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Background Track (Gray) */}
            <path 
                d="M 20 100 A 80 80 0 0 1 180 100" 
                fill="none" 
                stroke="#1e293b" // slate-800
                strokeWidth="12" 
                strokeLinecap="round"
            />

            {/* Ticks */}
            {ticks.map((tickVal, i) => {
                const tickPct = tickVal / maxVal;
                const tickAngle = -180 + (tickPct * 180); // 0 to 180 range for math, mapped to arc
                // Convert angle to coordinates for tick lines
                // Center is 100,100. Radius is 80 (inner) to 95 (outer)
                const angleRad = (tickAngle * Math.PI) / 180;
                const x1 = 100 + 70 * Math.cos(angleRad);
                const y1 = 100 + 70 * Math.sin(angleRad);
                const x2 = 100 + 90 * Math.cos(angleRad);
                const y2 = 100 + 90 * Math.sin(angleRad);
                
                return (
                    <g key={i}>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth="2" />
                        <text 
                            x={100 + 105 * Math.cos(angleRad)} 
                            y={100 + 105 * Math.sin(angleRad)} 
                            textAnchor="middle" 
                            dominantBaseline="middle" 
                            className="text-[8px] fill-slate-500 font-mono"
                            style={{ fontSize: '8px' }}
                        >
                            {Math.round(tickVal)}
                        </text>
                    </g>
                );
            })}

            {/* Active Value Arc (Colored) */}
            {/* We use strokeDasharray to animate the arc length */}
            {/* Arc length for semi-circle of radius 80 is PI * 80 = ~251.3 */}
            <path 
                d="M 20 100 A 80 80 0 0 1 180 100" 
                fill="none" 
                stroke={strokeColor} 
                strokeWidth="12" 
                strokeLinecap="round"
                strokeDasharray="251.3"
                strokeDashoffset={251.3 * (1 - percentage)}
                className="transition-all duration-1000 ease-out"
                filter="url(#glow)"
                opacity="0.9"
            />

            {/* Needle */}
            <g 
                transform={`rotate(${rotation}, 100, 100)`} 
                className="transition-transform duration-1000 ease-out"
            >
                {/* Needle Shape */}
                <path d="M 100 100 L 100 25" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
                <circle cx="100" cy="100" r="6" fill={strokeColor} />
            </g>

        </svg>
      </div>

      {/* Value Text */}
      <div className="flex flex-col items-center mt-2">
        <span className={`text-5xl font-bold ${colorClass} tabular-nums`}>{value.toFixed(1)}</span>
        <span className="text-sm text-slate-400 font-medium tracking-widest mt-1">REQ / SEGUNDO</span>
      </div>
    </div>
  );
};