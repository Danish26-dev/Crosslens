import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState, Suspense, useEffect } from "react";
import * as THREE from "three";

const SPHERE_RADIUS = 2.2;
const NODE_COUNT = 140;
const CONNECTION_COUNT = 180;
const PARTICLE_COUNT = 60;

type Node = { pos: THREE.Vector3; kind: "witness" | "evidence" | "statement" | "timeline" };

function useMemoryData() {
  return useMemo(() => {
    const rand = mulberry32(7);
    const nodes: Node[] = [];
    const kinds: Node["kind"][] = ["witness", "evidence", "statement", "timeline"];
    for (let i = 0; i < NODE_COUNT; i++) {
      // Uniform points inside a sphere
      const u = rand();
      const v = rand();
      const w = rand();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = SPHERE_RADIUS * Math.cbrt(w) * 0.92;
      nodes.push({
        pos: new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ),
        kind: kinds[i % kinds.length],
      });
    }

    // Build k-nearest connections (deterministic subset)
    const pairs: Array<[number, number]> = [];
    const seen = new Set<string>();
    for (let i = 0; i < NODE_COUNT && pairs.length < CONNECTION_COUNT; i++) {
      const dists: Array<[number, number]> = [];
      for (let j = 0; j < NODE_COUNT; j++) {
        if (i === j) continue;
        dists.push([j, nodes[i].pos.distanceTo(nodes[j].pos)]);
      }
      dists.sort((a, b) => a[1] - b[1]);
      for (let k = 0; k < 3 && pairs.length < CONNECTION_COUNT; k++) {
        const j = dists[k][0];
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (seen.has(key)) continue;
        seen.add(key);
        pairs.push([i, j]);
      }
    }

    return { nodes, pairs };
  }, []);
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function OuterShell() {
  const wireRef = useRef<THREE.LineSegments>(null);
  const glassRef = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (wireRef.current) wireRef.current.rotation.y += dt * 0.05;
    if (glassRef.current) glassRef.current.rotation.y -= dt * 0.02;
  });

  return (
    <group>
      <mesh ref={glassRef}>
        <sphereGeometry args={[SPHERE_RADIUS * 1.02, 48, 48]} />
        <meshPhysicalMaterial
          color="#2563EB"
          transparent
          opacity={0.05}
          roughness={0.15}
          metalness={0.2}
          transmission={0.9}
          thickness={0.3}
          clearcoat={1}
        />
      </mesh>
      <lineSegments ref={wireRef}>
        <edgesGeometry args={[new THREE.IcosahedronGeometry(SPHERE_RADIUS * 1.04, 3)]} />
        <lineBasicMaterial color="#4F46E5" transparent opacity={0.18} />
      </lineSegments>
    </group>
  );
}

function Nodes({ nodes }: { nodes: Node[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const phases = useMemo(() => nodes.map(() => Math.random() * Math.PI * 2), [nodes]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    nodes.forEach((n, i) => {
      const s = 0.045 + 0.02 * Math.sin(t * 1.6 + phases[i]);
      dummy.position.copy(n.pos);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, nodes.length]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial
        color="#93c5fd"
        emissive="#3b82f6"
        emissiveIntensity={2.4}
        roughness={0.3}
      />
    </instancedMesh>
  );
}

function Connections({
  nodes,
  pairs,
}: {
  nodes: Node[];
  pairs: Array<[number, number]>;
}) {
  const geomRef = useRef<THREE.BufferGeometry>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  const flashRef = useRef<{ index: number; start: number } | null>(null);
  const colorAttr = useMemo(() => {
    const arr = new Float32Array(pairs.length * 2 * 3);
    for (let i = 0; i < pairs.length * 2; i++) {
      arr[i * 3 + 0] = 0.31; // r ~ #4F46E5 -> normalized
      arr[i * 3 + 1] = 0.27;
      arr[i * 3 + 2] = 0.9;
    }
    return arr;
  }, [pairs]);

  const positions = useMemo(() => {
    const arr = new Float32Array(pairs.length * 2 * 3);
    pairs.forEach(([a, b], i) => {
      arr[i * 6 + 0] = nodes[a].pos.x;
      arr[i * 6 + 1] = nodes[a].pos.y;
      arr[i * 6 + 2] = nodes[a].pos.z;
      arr[i * 6 + 3] = nodes[b].pos.x;
      arr[i * 6 + 4] = nodes[b].pos.y;
      arr[i * 6 + 5] = nodes[b].pos.z;
    });
    return arr;
  }, [nodes, pairs]);

  useEffect(() => {
    if (!geomRef.current) return;
    geomRef.current.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geomRef.current.setAttribute("color", new THREE.BufferAttribute(colorAttr, 3));
  }, [positions, colorAttr]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.opacity = 0.22 + 0.12 * Math.sin(t * 0.9);
    }

    if (!geomRef.current) return;
    const colAttr = geomRef.current.getAttribute("color") as THREE.BufferAttribute;

    // Maybe spawn a contradiction flash
    if (!flashRef.current && Math.random() < 0.008) {
      flashRef.current = { index: Math.floor(Math.random() * pairs.length), start: t };
    }
    if (flashRef.current) {
      const elapsed = t - flashRef.current.start;
      const idx = flashRef.current.index;
      if (elapsed > 1.0) {
        // reset
        colAttr.setXYZ(idx * 2, 0.31, 0.27, 0.9);
        colAttr.setXYZ(idx * 2 + 1, 0.31, 0.27, 0.9);
        flashRef.current = null;
      } else {
        const k = 1 - elapsed; // fade out red
        const r = 0.86;
        const g = 0.15 + (1 - k) * 0.15;
        const b = 0.15 + (1 - k) * 0.15;
        colAttr.setXYZ(idx * 2, r, g, b);
        colAttr.setXYZ(idx * 2 + 1, r, g, b);
      }
      colAttr.needsUpdate = true;
    }
  });

  return (
    <lineSegments>
      <bufferGeometry ref={geomRef} />
      <lineBasicMaterial ref={materialRef} vertexColors transparent opacity={0.3} />
    </lineSegments>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = SPHERE_RADIUS * (1.3 + Math.random() * 0.9);
      pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.08;
    ref.current.rotation.x += dt * 0.02;
  });

  return (
    <points ref={ref} geometry={geom}>
      <pointsMaterial
        color="#2563EB"
        size={0.04}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function CoreGlow() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const s = 1 + 0.08 * Math.sin(t * 1.4);
    ref.current.scale.setScalar(s);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.28, 24, 24]} />
      <meshStandardMaterial
        color="#c7d2fe"
        emissive="#4F46E5"
        emissiveIntensity={3}
      />
    </mesh>
  );
}

function Scene({ mouse }: { mouse: { x: number; y: number } }) {
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const data = useMemoryData();

  useFrame((_, dt) => {
    if (!group.current) return;
    group.current.rotation.y += dt * 0.12;
    // Mouse parallax: subtle camera lerp
    camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.04;
    camera.position.y += (mouse.y * 0.5 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={group}>
      <CoreGlow />
      <Nodes nodes={data.nodes} />
      <Connections nodes={data.nodes} pairs={data.pairs} />
      <OuterShell />
      <Particles />
    </group>
  );
}

export function MemorySphere() {
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
      <Canvas camera={{ position: [0, 0, 6.5], fov: 42 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[6, 4, 6]} intensity={30} color="#93c5fd" />
        <pointLight position={[-5, -3, 4]} intensity={22} color="#a5b4fc" />
        <Suspense fallback={null}>
          <Scene mouse={mouse} />
        </Suspense>
      </Canvas>
    </div>
  );
}
