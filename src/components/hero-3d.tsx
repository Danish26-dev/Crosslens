import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState, Suspense } from "react";
import * as THREE from "three";

type NodeSpec = { position: [number, number, number]; color: string; size: number; kind: string };

const NODES: NodeSpec[] = [
  { position: [0, 0, 0], color: "#3b82f6", size: 0.35, kind: "case" },
  { position: [1.6, 0.6, -0.3], color: "#60a5fa", size: 0.22, kind: "witness" },
  { position: [-1.7, 0.4, 0.2], color: "#60a5fa", size: 0.22, kind: "witness" },
  { position: [0.4, 1.6, 0.6], color: "#60a5fa", size: 0.22, kind: "witness" },
  { position: [2.4, -0.2, 0.7], color: "#a78bfa", size: 0.16, kind: "statement" },
  { position: [-2.3, -0.6, -0.5], color: "#a78bfa", size: 0.16, kind: "statement" },
  { position: [1.2, -1.4, 0.4], color: "#a78bfa", size: 0.16, kind: "statement" },
  { position: [-1.0, 1.5, -0.8], color: "#a78bfa", size: 0.16, kind: "statement" },
  { position: [-0.5, -1.8, 0.9], color: "#34d399", size: 0.19, kind: "evidence" },
  { position: [2.0, 1.2, -0.9], color: "#34d399", size: 0.19, kind: "evidence" },
  { position: [-2.6, 0.8, 0.6], color: "#f59e0b", size: 0.2, kind: "contradiction" },
  { position: [0.9, -0.9, -1.4], color: "#f59e0b", size: 0.2, kind: "contradiction" },
];

const EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [1, 4], [1, 9], [2, 5], [2, 10], [3, 7],
  [3, 9], [4, 11], [5, 8], [6, 8], [7, 10], [0, 11], [0, 8], [1, 6],
];

function Node({ node }: { node: NodeSpec }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const s = node.size * (1 + 0.06 * Math.sin(t * 2 + node.position[0]));
    ref.current.scale.set(s, s, s);
  });
  return (
    <mesh ref={ref} position={node.position}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshStandardMaterial
        color={node.color}
        emissive={node.color}
        emissiveIntensity={0.7}
        roughness={0.3}
        metalness={0.2}
      />
    </mesh>
  );
}

function Edges() {
  const linesRef = useRef<THREE.LineSegments>(null);
  const geometry = useMemo(() => {
    const positions: number[] = [];
    for (const [a, b] of EDGES) {
      positions.push(...NODES[a].position, ...NODES[b].position);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, []);
  useFrame(({ clock }) => {
    if (!linesRef.current) return;
    const mat = linesRef.current.material as THREE.LineBasicMaterial;
    mat.opacity = 0.35 + 0.25 * Math.sin(clock.getElapsedTime() * 1.2);
  });
  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial color="#3b82f6" transparent opacity={0.4} />
    </lineSegments>
  );
}

function Scene({ mouse }: { mouse: { x: number; y: number } }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.12;
    group.current.rotation.x += (mouse.y * 0.3 - group.current.rotation.x) * 0.04;
    group.current.rotation.z += (mouse.x * 0.2 - group.current.rotation.z) * 0.04;
  });
  return (
    <group ref={group}>
      <Edges />
      {NODES.map((n, i) => (
        <Node key={i} node={n} />
      ))}
    </group>
  );
}

export function Hero3D() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  return (
    <div
      className="relative h-full w-full"
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMouse({
          x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
          y: -(((e.clientY - rect.top) / rect.height) * 2 - 1),
        });
      }}
    >
      <Canvas camera={{ position: [0, 0, 6.5], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={40} color="#93c5fd" />
        <pointLight position={[-5, -3, 3]} intensity={30} color="#c4b5fd" />
        <Suspense fallback={null}>
          <Scene mouse={mouse} />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
    </div>
  );
}
