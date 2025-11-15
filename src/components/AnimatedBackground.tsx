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

export const AnimatedBackground = () => {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    
    const generatedStars = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1, 
      animationDelay: Math.random() * 3,
      animationDuration: Math.random() * 3 + 2, 
      moveDistance: Math.random() * 50 + 20, 
      moveDirection: Math.random() * 360, 
    }));
    setStars(generatedStars);
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
    </div>
  );
};
