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

// Moroccan Zellige Tile Pattern
function ZelligeTile({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.getElapsedTime() * 0.15;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Central star */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i * Math.PI) / 4;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.4, Math.sin(angle) * 0.4, 0]}>
            <boxGeometry args={[0.15, 0.6, 0.05]} />
            <meshStandardMaterial color="#2ba5a5" transparent opacity={0.4} />
          </mesh>
        );
      })}
      {/* Outer frame */}
      <mesh>
        <torusGeometry args={[0.7, 0.08, 8, 8]} />
        <meshStandardMaterial color="#2ba5a5" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// Kente Cloth Pattern
function KentePattern({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.25;
      meshRef.current.position.y = position[1] + Math.cos(state.clock.getElapsedTime() * 0.6) * 0.4;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Vertical strips */}
      {[-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => (
        <mesh key={`v${i}`} position={[x, 0, 0]}>
          <boxGeometry args={[0.12, 1.2, 0.05]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#ed6c2e" : "#2ba5a5"} transparent opacity={0.5} />
        </mesh>
      ))}
      {/* Horizontal strips */}
      {[-0.4, -0.2, 0, 0.2, 0.4].map((y, i) => (
        <mesh key={`h${i}`} position={[0, y, 0.02]}>
          <boxGeometry args={[1.2, 0.12, 0.05]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#2ba5a5" : "#ed6c2e"} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// Arabesque Pattern (Flowing Islamic Design)
function ArabesquePattern({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = -state.clock.getElapsedTime() * 0.2;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.7 + position[0]) * 0.6;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Central flower */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i * Math.PI) / 3;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.3, Math.sin(angle) * 0.3, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#2ba5a5" transparent opacity={0.4} />
          </mesh>
        );
      })}
      {/* Connecting curves */}
      {[0, 1, 2].map((i) => {
        const angle = (i * Math.PI * 2) / 3;
        return (
          <mesh key={`c${i}`} position={[Math.cos(angle) * 0.5, Math.sin(angle) * 0.5, 0]} rotation={[0, 0, angle]}>
            <torusGeometry args={[0.2, 0.05, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#2ba5a5" transparent opacity={0.35} />
          </mesh>
        );
      })}
    </group>
  );
}

// Mudcloth Pattern (Mali Bogolan)
function MudclothPattern({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.getElapsedTime() * 0.18;
      groupRef.current.position.y = position[1] + Math.cos(state.clock.getElapsedTime() * 0.8 + position[2]) * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Zigzag pattern */}
      {[-0.3, 0, 0.3].map((y, i) => (
        <mesh key={`z${i}`} position={[0, y, 0]}>
          <boxGeometry args={[1.0, 0.08, 0.05]} />
          <meshStandardMaterial color="#ed6c2e" transparent opacity={0.4} />
        </mesh>
      ))}
      {/* Dots pattern */}
      {[-0.4, -0.2, 0.2, 0.4].map((y) =>
        [-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => (
          <mesh key={`d${y}${i}`} position={[x, y, 0.02]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#ed6c2e" transparent opacity={0.5} />
          </mesh>
        ))
      )}
    </group>
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
      
      {/* Traditional Cultural Patterns */}
      {/* Moroccan Zellige Tiles */}
      <ZelligeTile position={[-8, 3, -5]} />
      <ZelligeTile position={[10, 5, -8]} />
      <ZelligeTile position={[-6, 7, 5]} />
      
      {/* Kente Cloth Patterns */}
      <KentePattern position={[8, 4, -3]} />
      <KentePattern position={[-10, 6, 3]} />
      
      {/* Arabesque Patterns */}
      <ArabesquePattern position={[5, 5, -7]} />
      <ArabesquePattern position={[-7, 4, 2]} />
      <ArabesquePattern position={[12, 6, -2]} />
      
      {/* Mudcloth Patterns */}
      <MudclothPattern position={[-5, 8, -4]} />
      <MudclothPattern position={[7, 3, 4]} />
      <MudclothPattern position={[-9, 5, -6]} />
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
