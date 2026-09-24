import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function Arc({ rotation, color, radius = 2.25 }: { rotation: [number, number, number]; color: string; radius?: number }) {
  return (
    <mesh rotation={rotation}>
      <torusGeometry args={[radius, 0.012, 6, 150]} />
      <meshBasicMaterial color={color} transparent opacity={0.62} />
    </mesh>
  );
}

function Planet() {
  const planet = useRef<THREE.Group>(null);
  const markers = useMemo(() => Array.from({ length: 34 }, (_, index) => {
    const phi = Math.acos(-1 + (2 * index) / 34);
    const theta = Math.sqrt(34 * Math.PI) * phi;
    return new THREE.Vector3(
      2.03 * Math.cos(theta) * Math.sin(phi),
      2.03 * Math.sin(theta) * Math.sin(phi),
      2.03 * Math.cos(phi)
    );
  }), []);

  useFrame((state, delta) => {
    if (!planet.current) return;
    planet.current.rotation.y += delta * 0.07;
    planet.current.rotation.x = -0.16 + state.pointer.y * 0.05;
    planet.current.rotation.z = state.pointer.x * -0.08;
  });

  return (
    <group ref={planet} rotation={[-0.15, 0.3, -0.12]}>
      <mesh>
        <icosahedronGeometry args={[2, 7]} />
        <meshStandardMaterial color="#061d3d" roughness={0.82} metalness={0.24} emissive="#021027" emissiveIntensity={0.55} />
      </mesh>
      <mesh scale={1.006}>
        <icosahedronGeometry args={[2, 4]} />
        <meshBasicMaterial color="#2f82ff" wireframe transparent opacity={0.22} />
      </mesh>
      <mesh scale={1.05}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial color="#4ca6ff" transparent opacity={0.08} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <Arc rotation={[Math.PI / 2.3, 0.2, 0]} color="#FFC72C" />
      <Arc rotation={[0.45, 0.4, Math.PI / 2.6]} color="#4CA6FF" radius={2.28} />
      <Arc rotation={[1.2, -0.35, 0.45]} color="#2F82FF" radius={2.33} />
      {markers.map((point, index) => (
        <mesh key={index} position={point} scale={index % 8 === 0 ? 1.65 : 1}>
          <sphereGeometry args={[0.026, 8, 8]} />
          <meshBasicMaterial color={index % 5 === 0 ? '#FFC72C' : '#7BE7FF'} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Stars() {
  const geometry = useMemo(() => {
    const points = new Float32Array(700 * 3);
    for (let i = 0; i < 700; i += 1) {
      points[i * 3] = (Math.random() - 0.5) * 18;
      points[i * 3 + 1] = (Math.random() - 0.5) * 12;
      points[i * 3 + 2] = -1 - Math.random() * 8;
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.BufferAttribute(points, 3));
    return result;
  }, []);
  return (
    <points geometry={geometry}>
      <pointsMaterial color="#83bbff" size={0.018} transparent opacity={0.65} sizeAttenuation />
    </points>
  );
}

export function EarthScene() {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 6.4], fov: 42 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[-3, 4, 5]} intensity={4.2} color="#79c9ff" />
      <pointLight position={[4, -2, 3]} intensity={12} color="#FFC72C" distance={9} />
      <Stars />
      <Planet />
    </Canvas>
  );
}
