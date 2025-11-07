import menaAfricaMap from '@/assets/mena-africa-map-original.png';

export const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background" />
      
      {/* Map with 3D relief effect */}
      <div 
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${menaAfricaMap})`,
          opacity: 0.6,
        }}
      />
      
      {/* Soft vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/40" />
    </div>
  );
};
