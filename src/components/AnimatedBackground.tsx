// Animated background representing Sub-Saharan Africa and MENA regions
export const AnimatedBackground = () => {
  // Key cities/locations in Sub-Saharan Africa and MENA
  const locations = [
    { x: 45, y: 35, name: "Cairo", region: "mena" },
    { x: 52, y: 42, name: "Riyadh", region: "mena" },
    { x: 38, y: 40, name: "Casablanca", region: "mena" },
    { x: 48, y: 38, name: "Beirut", region: "mena" },
    { x: 42, y: 55, name: "Lagos", region: "africa" },
    { x: 50, y: 60, name: "Nairobi", region: "africa" },
    { x: 45, y: 68, name: "Johannesburg", region: "africa" },
    { x: 38, y: 52, name: "Accra", region: "africa" },
  ];

  // Connection lines between key cities
  const connections = [
    { from: 0, to: 1 }, // Cairo to Riyadh
    { from: 0, to: 3 }, // Cairo to Beirut
    { from: 2, to: 0 }, // Casablanca to Cairo
    { from: 4, to: 5 }, // Lagos to Nairobi
    { from: 5, to: 6 }, // Nairobi to Johannesburg
    { from: 7, to: 4 }, // Accra to Lagos
    { from: 0, to: 4 }, // Cairo to Lagos (Africa-MENA connection)
    { from: 1, to: 5 }, // Riyadh to Nairobi
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.15]" 
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Gradient for connection lines */}
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
          </linearGradient>
          
          {/* Animated pulse for location markers */}
          <radialGradient id="pulseGradient">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8">
              <animate attributeName="stop-opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0">
              <animate attributeName="stop-opacity" values="0;0.4;0" dur="3s" repeatCount="indefinite" />
            </stop>
          </radialGradient>

          {/* Flow animation along lines */}
          <animate id="flow" dur="4s" repeatCount="indefinite" />
        </defs>

        {/* Connection lines with animated flow */}
        <g className="connections">
          {connections.map((conn, index) => {
            const from = locations[conn.from];
            const to = locations[conn.to];
            const dashLength = Math.hypot(to.x - from.x, to.y - from.y) * 2;
            
            return (
              <g key={index}>
                {/* Static line */}
                <line
                  x1={`${from.x}%`}
                  y1={`${from.y}%`}
                  x2={`${to.x}%`}
                  y2={`${to.y}%`}
                  stroke="url(#lineGradient)"
                  strokeWidth="0.3"
                  strokeDasharray="2,4"
                  opacity="0.4"
                />
                
                {/* Animated flow line */}
                <line
                  x1={`${from.x}%`}
                  y1={`${from.y}%`}
                  x2={`${to.x}%`}
                  y2={`${to.y}%`}
                  stroke="hsl(var(--accent))"
                  strokeWidth="0.5"
                  strokeDasharray={`${dashLength / 10},${dashLength}`}
                  strokeLinecap="round"
                  opacity="0.6"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from={dashLength}
                    to="0"
                    dur={`${4 + index * 0.5}s`}
                    repeatCount="indefinite"
                  />
                </line>
              </g>
            );
          })}
        </g>

        {/* Location markers with pulsing animation */}
        <g className="locations">
          {locations.map((location, index) => (
            <g key={index}>
              {/* Outer pulse ring */}
              <circle
                cx={`${location.x}%`}
                cy={`${location.y}%`}
                r="2"
                fill="url(#pulseGradient)"
              >
                <animate
                  attributeName="r"
                  values="2;4;2"
                  dur="3s"
                  begin={`${index * 0.3}s`}
                  repeatCount="indefinite"
                />
              </circle>
              
              {/* Core dot */}
              <circle
                cx={`${location.x}%`}
                cy={`${location.y}%`}
                r="0.8"
                fill={location.region === "mena" ? "hsl(var(--primary))" : "hsl(var(--accent))"}
                opacity="0.9"
              >
                <animate
                  attributeName="opacity"
                  values="0.9;0.5;0.9"
                  dur="2s"
                  begin={`${index * 0.2}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          ))}
        </g>

        {/* Flowing particles */}
        {[...Array(6)].map((_, i) => (
          <circle
            key={`particle-${i}`}
            r="0.4"
            fill="hsl(var(--primary))"
            opacity="0.5"
          >
            <animateMotion
              dur={`${15 + i * 3}s`}
              repeatCount="indefinite"
              path={`M ${locations[i % locations.length].x} ${locations[i % locations.length].y} 
                     Q ${locations[(i + 2) % locations.length].x} ${locations[(i + 2) % locations.length].y}
                       ${locations[(i + 4) % locations.length].x} ${locations[(i + 4) % locations.length].y}`}
            />
            <animate
              attributeName="opacity"
              values="0;0.6;0"
              dur={`${15 + i * 3}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>

      {/* Subtle regional glow effects */}
      <div className="absolute top-[35%] left-[42%] w-[200px] h-[200px] bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute top-[55%] left-[40%] w-[250px] h-[250px] bg-accent/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
    </div>
  );
};
