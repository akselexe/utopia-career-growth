import { Canvas } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Animated Ocean/Sand Waves
function Waves({ position, color, speed = 1 }: { position: [number, number, number]; color: string; speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(50, 50, 100, 100);
    return geo;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime() * speed;
      const positions = geometry.attributes.position;
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        
        // Create wave effect
        const wave1 = Math.sin(x * 0.2 + time) * 0.3;
        const wave2 = Math.sin(y * 0.3 + time * 0.5) * 0.2;
        const wave3 = Math.sin((x + y) * 0.1 + time * 0.3) * 0.15;
        
        positions.setZ(i, wave1 + wave2 + wave3);
      }
      
      positions.needsUpdate = true;
      geometry.computeVertexNormals();
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]} geometry={geometry}>
      <meshStandardMaterial 
        color={color} 
        wireframe={false}
        transparent={true}
        opacity={0.6}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Floating Particles
function Particles({ count = 100 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = Math.random() * 20 - 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    
    return positions;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#ed6c2e" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

// Islamic Star Pattern (8-pointed star)
function IslamicStar({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 8;
    const outerRadius = 0.8;
    const innerRadius = 0.4;
    
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    shape.closePath();
    
    return new THREE.ShapeGeometry(shape);
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position} geometry={starShape}>
      <meshStandardMaterial color="#2ba5a5" transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
}

// Adinkra Symbol - Gye Nyame (Supremacy of God)
function AdinkraSymbol({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      meshRef.current.position.y = position[1] + Math.cos(state.clock.getElapsedTime() * 0.6) * 0.4;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Central circle */}
      <mesh>
        <torusGeometry args={[0.5, 0.1, 16, 32]} />
        <meshStandardMaterial color="#ed6c2e" transparent opacity={0.4} />
      </mesh>
      {/* Cross pattern */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.15, 1.2, 0.15]} />
        <meshStandardMaterial color="#ed6c2e" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 0.15, 0.15]} />
        <meshStandardMaterial color="#ed6c2e" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

// Geometric Hexagon (Berber/Islamic pattern)
function GeometricHexagon({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const hexShape = useMemo(() => {
    const shape = new THREE.Shape();
    const sides = 6;
    const radius = 0.6;
    
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    shape.closePath();
    
    return new THREE.ShapeGeometry(shape);
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = -state.clock.getElapsedTime() * 0.15;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.7 + position[0]) * 0.6;
    }
  });

  return (
    <mesh ref={meshRef} position={position} geometry={hexShape}>
      <meshStandardMaterial color="#2ba5a5" transparent opacity={0.25} side={THREE.DoubleSide} />
    </mesh>
  );
}

// Diamond Pattern (Common in both African and MENA art)
function DiamondPattern({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const diamondShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.8);
    shape.lineTo(0.6, 0);
    shape.lineTo(0, -0.8);
    shape.lineTo(-0.6, 0);
    shape.closePath();
    
    return new THREE.ShapeGeometry(shape);
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.25;
      meshRef.current.position.y = position[1] + Math.cos(state.clock.getElapsedTime() * 0.8 + position[2]) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position} geometry={diamondShape}>
      <meshStandardMaterial color="#ed6c2e" transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
}

// Main Scene
function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <hemisphereLight color="#87ceeb" groundColor="#f5deb3" intensity={0.6} />
      
      {/* Desert Sand Waves - Warm tones */}
      <Waves position={[0, -2, -10]} color="#ed6c2e" speed={0.3} />
      
      {/* Ocean Waves - Cool tones */}
      <Waves position={[0, -3, 10]} color="#2ba5a5" speed={0.5} />
      
      {/* Subtle Particles */}
      <Particles count={80} />
      
      {/* Cultural Geometric Shapes */}
      {/* Islamic Stars */}
      <IslamicStar position={[-8, 3, -5]} />
      <IslamicStar position={[10, 5, -8]} />
      <IslamicStar position={[-6, 7, 5]} />
      
      {/* Adinkra Symbols */}
      <AdinkraSymbol position={[8, 4, -3]} />
      <AdinkraSymbol position={[-10, 6, 3]} />
      
      {/* Geometric Hexagons */}
      <GeometricHexagon position={[5, 5, -7]} />
      <GeometricHexagon position={[-7, 4, 2]} />
      <GeometricHexagon position={[12, 6, -2]} />
      
      {/* Diamond Patterns */}
      <DiamondPattern position={[-5, 8, -4]} />
      <DiamondPattern position={[7, 3, 4]} />
      <DiamondPattern position={[-9, 5, -6]} />
    </>
  );
}

// Main Component
export const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 opacity-20">
      <Canvas
        camera={{ position: [0, 5, 15], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};
