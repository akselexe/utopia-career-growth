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
