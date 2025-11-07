import { useEffect, useState } from "react";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  animationDelay: number;
  animationDuration: number;
  moveDistance: number;
  moveDirection: number;
}

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  animationDelay: number;
}

export const AnimatedBackground = () => {
  const [stars, setStars] = useState<Star[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);

  useEffect(() => {
    // Generate 150 stars with random positions and properties
    const generatedStars = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1, // 1-3px
      animationDelay: Math.random() * 3,
      animationDuration: Math.random() * 3 + 2, // 2-5s
      moveDistance: Math.random() * 50 + 20, // 20-70px movement
      moveDirection: Math.random() * 360, // Random direction in degrees
    }));
    setStars(generatedStars);

    // Generate 5 shooting stars with staggered delays
    const generatedShootingStars = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      startX: Math.random() * 100,
      startY: Math.random() * 50, // Start from top half
      animationDelay: i * 4, // Stagger by 4 seconds
    }));
    setShootingStars(generatedShootingStars);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-black">
      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-star-move"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.animationDelay}s`,
            animationDuration: `${star.animationDuration}s`,
            '--move-x': `${Math.cos(star.moveDirection * Math.PI / 180) * star.moveDistance}px`,
            '--move-y': `${Math.sin(star.moveDirection * Math.PI / 180) * star.moveDistance}px`,
          } as React.CSSProperties}
        />
      ))}
      
      {/* Shooting Stars */}
      {shootingStars.map((shootingStar) => (
        <div
          key={`shooting-${shootingStar.id}`}
          className="absolute w-1 h-1 bg-white rounded-full animate-shooting-star"
          style={{
            left: `${shootingStar.startX}%`,
            top: `${shootingStar.startY}%`,
            animationDelay: `${shootingStar.animationDelay}s`,
            boxShadow: '0 0 4px 2px rgba(255, 255, 255, 0.8)',
          }}
        />
      ))}
    </div>
  );
};
