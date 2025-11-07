// Animated background with stars
export const AnimatedBackground = () => {
  // Generate random stars across the regions
  const generateStars = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 0.8 + 0.2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 3,
      opacity: Math.random() * 0.5 + 0.3,
    }));
  };

  const stars = generateStars(80);
  const shootingStars = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    delay: i * 4,
    duration: 2 + Math.random() * 1,
    startX: Math.random() * 100,
    startY: Math.random() * 30,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg 
        className="absolute inset-0 w-full h-full opacity-20" 
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Star twinkle gradient */}
          <radialGradient id="starGradient">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
          </radialGradient>

          {/* Shooting star gradient */}
          <linearGradient id="shootingStarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Twinkling stars */}
        <g className="stars">
          {stars.map((star) => (
            <circle
              key={star.id}
              cx={`${star.x}%`}
              cy={`${star.y}%`}
              r={star.size}
              fill="url(#starGradient)"
              opacity={star.opacity}
            >
              <animate
                attributeName="opacity"
                values={`${star.opacity};${star.opacity * 0.3};${star.opacity}`}
                dur={`${star.duration}s`}
                begin={`${star.delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values={`${star.size};${star.size * 1.5};${star.size}`}
                dur={`${star.duration}s`}
                begin={`${star.delay}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>

        {/* Shooting stars */}
        <g className="shooting-stars">
          {shootingStars.map((star) => (
            <line
              key={star.id}
              x1={`${star.startX}%`}
              y1={`${star.startY}%`}
              x2={`${star.startX + 15}%`}
              y2={`${star.startY + 15}%`}
              stroke="url(#shootingStarGradient)"
              strokeWidth="0.3"
              strokeLinecap="round"
              opacity="0"
            >
              <animate
                attributeName="opacity"
                values="0;0.8;0"
                dur={`${star.duration}s`}
                begin={`${star.delay}s`}
                repeatCount="indefinite"
              />
              <animateTransform
                attributeName="transform"
                type="translate"
                from="0 0"
                to="20 20"
                dur={`${star.duration}s`}
                begin={`${star.delay}s`}
                repeatCount="indefinite"
              />
            </line>
          ))}
        </g>

        {/* Constellation lines - subtle connections */}
        <g className="constellations" opacity="0.15">
          <line x1="20%" y1="30%" x2="35%" y2="45%" stroke="hsl(var(--primary))" strokeWidth="0.2" />
          <line x1="35%" y1="45%" x2="45%" y2="35%" stroke="hsl(var(--primary))" strokeWidth="0.2" />
          <line x1="60%" y1="40%" x2="70%" y2="55%" stroke="hsl(var(--accent))" strokeWidth="0.2" />
          <line x1="25%" y1="60%" x2="40%" y2="70%" stroke="hsl(var(--accent))" strokeWidth="0.2" />
          <line x1="40%" y1="70%" x2="50%" y2="65%" stroke="hsl(var(--primary))" strokeWidth="0.2" />
        </g>
      </svg>

      {/* Ambient glow effects */}
      <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute top-[60%] right-[20%] w-[250px] h-[250px] bg-accent/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
    </div>
  );
};
