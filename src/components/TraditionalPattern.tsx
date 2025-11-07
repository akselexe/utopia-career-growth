// Traditional African & MENA geometric patterns component
export const TraditionalPattern = () => {
  return (
    <svg 
      className="absolute inset-0 w-full h-full opacity-[0.03]" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Adinkra-inspired pattern (West African) */}
        <pattern id="adinkra" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M40 0 L40 80 M0 40 L80 40" stroke="currentColor" strokeWidth="1" fill="none"/>
          <circle cx="40" cy="40" r="15" stroke="currentColor" strokeWidth="1" fill="none"/>
          <path d="M25 25 L55 25 L55 55 L25 55 Z" stroke="currentColor" strokeWidth="1" fill="none"/>
        </pattern>
        
        {/* Islamic geometric pattern (MENA) */}
        <pattern id="islamic" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M50 0 L100 50 L50 100 L0 50 Z" stroke="currentColor" strokeWidth="1" fill="none"/>
          <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="1" fill="none"/>
          <path d="M50 10 L90 50 L50 90 L10 50 Z" stroke="currentColor" strokeWidth="1" fill="none"/>
        </pattern>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#adinkra)"/>
      <rect width="100%" height="100%" fill="url(#islamic)" opacity="0.5"/>
    </svg>
  );
};

// Animated cultural elements
export const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle floating geometric shapes inspired by traditional art */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 opacity-5 animate-float-slow">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 10 L90 50 L50 90 L10 50 Z" stroke="currentColor" fill="none" strokeWidth="2"/>
        </svg>
      </div>
      
      <div className="absolute top-1/2 right-1/4 w-24 h-24 opacity-5 animate-float-slower" style={{ animationDelay: '2s' }}>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" stroke="currentColor" fill="none" strokeWidth="2"/>
          <path d="M50 10 L50 90 M10 50 L90 50" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </div>
      
      <div className="absolute bottom-1/4 left-1/3 w-28 h-28 opacity-5 animate-float-slow" style={{ animationDelay: '4s' }}>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,15 90,85 10,85" stroke="currentColor" fill="none" strokeWidth="2"/>
        </svg>
      </div>
    </div>
  );
};
