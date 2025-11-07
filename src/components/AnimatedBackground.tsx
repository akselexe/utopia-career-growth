import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Rotating Globe with highlighted regions
function Globe() {
  const globeRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Base globe (ocean - blue) */}
      <mesh>
        <sphereGeometry args={[5, 64, 64]} />
        <meshStandardMaterial 
          color="#1e4d8b" 
          transparent 
          opacity={0.3}
          wireframe={false}
        />
      </mesh>
      
      {/* Africa - Highlighted in orange */}
      <mesh position={[0.5, 0.3, 4.8]} rotation={[0.2, 0, 0]}>
        <sphereGeometry args={[1.8, 32, 32, 0, Math.PI * 0.8, 0, Math.PI * 0.9]} />
        <meshStandardMaterial 
          color="#ed6c2e" 
          transparent 
          opacity={0.7}
          emissive="#ed6c2e"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* MENA Region - Highlighted in teal */}
      <mesh position={[1.2, 1.5, 4.5]} rotation={[0.5, 0.2, 0]}>
        <sphereGeometry args={[1.3, 32, 32, 0, Math.PI * 0.9, 0, Math.PI * 0.6]} />
        <meshStandardMaterial 
          color="#2ba5a5" 
          transparent 
          opacity={0.7}
          emissive="#2ba5a5"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Subtle latitude/longitude lines */}
      <mesh>
        <sphereGeometry args={[5.05, 32, 32]} />
        <meshBasicMaterial 
          color="#ffffff" 
          wireframe 
          transparent 
          opacity={0.08}
        />
      </mesh>
    </group>
  );
}

// Connection Lines (representing connectivity)
function ConnectionLines() {
  const linesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.children.forEach((child, i) => {
        const line = child as THREE.Line;
        const material = line.material as THREE.LineBasicMaterial;
        material.opacity = 0.2 + Math.sin(state.clock.getElapsedTime() * 0.5 + i) * 0.1;
      });
    }
  });

  // Create curved lines connecting different points on globe
  const createCurve = (start: THREE.Vector3, end: THREE.Vector3) => {
    const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
    mid.normalize().multiplyScalar(6); // Curve outward
    
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const points = curve.getPoints(30);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    return geometry;
  };

  return (
    <group ref={linesRef}>
      {/* Africa to MENA connections */}
      <line>
        <bufferGeometry attach="geometry" {...createCurve(
          new THREE.Vector3(0.5, 0.3, 4.8),
          new THREE.Vector3(1.2, 1.5, 4.5)
        )} />
        <lineBasicMaterial color="#ed6c2e" transparent opacity={0.3} />
      </line>
      <line>
        <bufferGeometry attach="geometry" {...createCurve(
          new THREE.Vector3(-0.5, -0.5, 4.9),
          new THREE.Vector3(2, 1, 4.3)
        )} />
        <lineBasicMaterial color="#2ba5a5" transparent opacity={0.3} />
      </line>
    </group>
  );
}
// Main Scene
function Scene() {
  return (
    <>
      {/* Ambient lighting for the globe */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#2ba5a5" />
      <pointLight position={[10, -5, 5]} intensity={0.5} color="#ed6c2e" />
      
      {/* World Globe with highlighted regions */}
      <Globe />
      
      {/* Connection lines */}
      <ConnectionLines />
    </>
  );
}

// Main Component
export const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 opacity-30">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};
