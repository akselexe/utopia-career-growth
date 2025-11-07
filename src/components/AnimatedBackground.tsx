import menaAfricaMap from '@/assets/mena-africa-map.png';

export const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${menaAfricaMap})`,
          opacity: 0.3,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50" />
    </div>
  );
};
