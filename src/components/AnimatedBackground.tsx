import { useEffect, useState } from 'react';
import menaAfricaMap from '@/assets/mena-africa-map.png';

export const AnimatedBackground = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#0a1628] animate-pulse-slow" />
      
      {/* MENA & Africa map with parallax effect */}
      <div 
        className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-transform duration-300"
        style={{
          backgroundImage: `url(${menaAfricaMap})`,
          opacity: 0.4,
          transform: `scale(1.1) translateY(${scrollY * 0.3}px)`,
        }}
      />
      
      {/* Glowing orbs for depth */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#ed6c2e] rounded-full blur-[120px] opacity-10 animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#2ba5a5] rounded-full blur-[120px] opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
};
