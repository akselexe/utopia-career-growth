import worldMap from '@/assets/world-map-highlighted.png';

export const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* World map background with subtle animation */}
      <div 
        className="absolute inset-0 bg-cover bg-center animate-fade-in"
        style={{
          backgroundImage: `url(${worldMap})`,
          opacity: 0.25,
        }}
      />
      
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/40" />
    </div>
  );
};
