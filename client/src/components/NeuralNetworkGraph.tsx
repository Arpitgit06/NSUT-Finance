// @ts-nocheck
import { useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── SEEDED RANDOM ──────────────────────────────────────────────── */
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ─── SYNTHETIC GRAPH ────────────────────────────────────────────── */
const NAMES = [
  'Ananya M','Rohan I','Meera S','Sahil N','Priya R','Vikram D','Neha K','Arjun P',
  'Divya T','Karthik S','Riya G','Aditya B','Sneha L','Manish C','Pooja V','Rajesh W',
  'Kavita H','Suresh J','Lakshmi N','Deepak M','Sunita R','Amit K','Geeta D','Ravi S',
  'Suman P','Harish T','Rekha B','Mohan L','Padma C','Vinod G','Usha W','Kishore H',
  'Jaya J','Sunil N','Anita M','Ramesh R','Vijaya K','Ganesh D','Sarita S','Mahesh P',
  'Shanti T','Naresh B','Kamala L','Girish C','Indira G','Prakash W','Radha H','Dinesh J',
  'Lata N','Satish M','Pushpa R','Ashok K','Chitra D','Sanjay S','Vimala P','Mukesh T',
  'Savita B','Ramana L','Uma C','Venkat G','Bharati W','Sudhir H','Janaki J','Manoj N',
  'Vasanta M','Shridhar R','Nirmal K','Devika D','Gopal S','Saroja P','Mohanraj T',
  'Bhavani B','Aruna L','Chandran C','Lalitha G','Vivek W','Malini H','Srinivas J',
  'Durga N','Balaji M','Gayatri R','Hari K','Meenakshi D','Jagdish S','Parvati P',
  'Nagaraj T','Shobha B','Kamal L','Revathi C','Prasad G','Sudha W','Raghav H',
  'Sita J','Venkatesh N','Anuradha M','Govindan R','Tulasi K','Kiran D','Nirmala S',
  'Bhaskar P','Damayanti T','Madhav B','Vaishali L','Shankar C','Sumathi G','Rajan W',
  'Hema H','Ajay J','Saraswati N','Eswaran M','Subha R','Devi K','Ramachandran D',
  'Kalpana S','Thiru P','Prabha T','Vishnu B','Rukmini L','Murali C',
];

function generateGraph() {
  const rand = seededRandom(42);
  const N = 120;
  const nodes = [];

  // 9 cluster centers spread across the viewport
  const centers = [
    { x: -10, y: 5 },  { x: 0, y: 7 },    { x: 9, y: 4 },
    { x: -8, y: -1 },  { x: 1, y: 0 },     { x: 10, y: -2 },
    { x: -6, y: -6 },  { x: 3, y: -7 },    { x: 11, y: -6 },
  ];

  for (let i = 0; i < N; i++) {
    const c = centers[Math.floor(rand() * centers.length)];
    const a = rand() * Math.PI * 2;
    const r = rand() * 2.5 + 0.4;
    const fraud = Math.floor(rand() * 100);
    const vol = Math.floor(rand() * 200000) + 5000;
    nodes.push({
      id: i,
      label: NAMES[i] || 'CUS-' + String(i).padStart(3, '0'),
      x: c.x + Math.cos(a) * r,
      y: c.y + Math.sin(a) * r,
      fraud,
      vol,
      w: vol / 205000,
    });
  }

  // Each edge = ONE thin line. More edges per high-fraud node.
  const edges = [];
  const seen = new Set();
  for (let i = 0; i < N; i++) {
    const ni = nodes[i];
    const count = Math.floor(1 + (ni.fraud / 100) * 4 + rand() * 2);
    const dists = nodes
      .map((nj, j) => ({ j, d: Math.hypot(ni.x - nj.x, ni.y - nj.y) }))
      .filter(d => d.j !== i)
      .sort((a, b) => a.d - b.d);

    for (let c = 0; c < Math.min(count, dists.length); c++) {
      const j = dists[c].j;
      const k = Math.min(i, j) + ',' + Math.max(i, j);
      if (!seen.has(k)) {
        seen.add(k);
        edges.push({ s: i, t: j });
      }
    }
  }
  return { nodes, edges };
}

/* ─── THIN HAIRLINE EDGES ────────────────────────────────────────────
   Each edge is ONE thin bezier curve. No bundles. The density comes
   from the number of connections, not from stacking lines.
   Normal blending so overlapping lines stay visible as individuals.
   ───────────────────────────────────────────────────────────────────── */

function ThinEdges({ nodes, edges }) {
  const geo = useMemo(() => {
    const positions = [];
    const opacities = [];

    for (const e of edges) {
      const s = nodes[e.s];
      const t = nodes[e.t];
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const px = -dy / dist;
      const py = dx / dist;

      // Gentle curve offset — just enough to look organic, not chaotic
      const bend = (Math.random() - 0.5) * dist * 0.3;

      const mx = (s.x + t.x) / 2 + px * bend;
      const my = (s.y + t.y) / 2 + py * bend;

      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(s.x, s.y, 0),
        new THREE.Vector3(mx, my, 0),
        new THREE.Vector3(t.x, t.y, 0),
      );

      const pts = curve.getPoints(30);
      const alpha = 0.12 + Math.random() * 0.2;

      for (let j = 0; j < 30; j++) {
        positions.push(pts[j].x, pts[j].y, 0);
        positions.push(pts[j + 1].x, pts[j + 1].y, 0);
        opacities.push(alpha, alpha);
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('aAlpha', new THREE.Float32BufferAttribute(opacities, 1));
    return g;
  }, [nodes, edges]);

  const VERT = `
    attribute float aAlpha;
    varying float vAlpha;
    void main() {
      vAlpha = aAlpha;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  const FRAG = `
    varying float vAlpha;
    void main() {
      gl_FragColor = vec4(0.75, 0.78, 0.82, vAlpha);
    }
  `;

  return (
    <lineSegments geometry={geo}>
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthWrite={false}
      />
    </lineSegments>
  );
}

/* ─── SMALL NODE DOTS ────────────────────────────────────────────────
   Tiny hollow rings — NOT big glowing blobs.
   ───────────────────────────────────────────────────────────────────── */

function NodeDots({ nodes }) {
  const geo = useMemo(() => {
    const pos = new Float32Array(nodes.length * 3);
    nodes.forEach((n, i) => {
      pos[i * 3] = n.x;
      pos[i * 3 + 1] = n.y;
      pos[i * 3 + 2] = 0.05;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [nodes]);

  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial color="#ffffff" size={0.08} sizeAttenuation transparent opacity={0.6} depthWrite={false} />
    </points>
  );
}

/* ─── TEAL LABELS (top 10 only) ──────────────────────────────────── */

function Labels({ nodes }) {
  const top = useMemo(
    () => nodes.filter(n => n.fraud > 72 || n.w > 0.7).slice(0, 10),
    [nodes],
  );

  const sprites = useMemo(() => {
    return top.map(n => {
      const c = document.createElement('canvas');
      c.width = 200;
      c.height = 40;
      const ctx = c.getContext('2d');
      if (!ctx) return null;
      ctx.clearRect(0, 0, 200, 40);
      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = '#4dd0e1';
      ctx.fillText(n.label.toUpperCase(), 4, 16);
      ctx.font = '11px monospace';
      ctx.fillStyle = '#556677';
      ctx.fillText('F:' + n.fraud + ' | ' + Math.floor(n.vol / 1000) + 'K', 4, 32);

      const tex = new THREE.CanvasTexture(c);
      tex.minFilter = THREE.LinearFilter;

      return (
        <sprite key={n.id} position={[n.x + 0.6, n.y + 0.4, 0.1]} scale={[1.8, 0.36, 1]}>
          <spriteMaterial map={tex} transparent depthWrite={false} />
        </sprite>
      );
    });
  }, [top]);

  return <>{sprites}</>;
}

/* ─── ANIMATED FLOW PARTICLES ──────────────────────────────────────── */

function FlowParticles({ nodes, edges }) {
  const count = 150;

  const pairs = useMemo(
    () => edges.map(e => ({ s: nodes[e.s], t: nodes[e.t] })),
    [nodes, edges],
  );

  const { geo, sim } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const opa = new Float32Array(count);
    const prog = new Float32Array(count);
    const spd = new Float32Array(count);
    const eidx = new Uint16Array(count);
    const off = new Float32Array(count * 2);
    const ec = pairs.length || 1;

    for (let i = 0; i < count; i++) {
      prog[i] = Math.random();
      spd[i] = 0.06 + Math.random() * 0.14;
      eidx[i] = Math.floor(Math.random() * ec);
      off[i * 2] = (Math.random() - 0.5) * 2.0;
      off[i * 2 + 1] = (Math.random() - 0.5) * 2.0;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aOpa', new THREE.BufferAttribute(opa, 1));
    return { geo: g, sim: { pos, opa, prog, spd, eidx, off } };
  }, [count, pairs]);

  useFrame((_, dt) => {
    if (!pairs.length) return;
    const d = Math.min(dt, 0.05);
    const { pos, opa, prog, spd, eidx, off } = sim;

    for (let i = 0; i < count; i++) {
      prog[i] += spd[i] * d;
      if (prog[i] > 1) {
        prog[i] -= 1;
        eidx[i] = Math.floor(Math.random() * pairs.length);
      }
      const e = pairs[eidx[i]];
      if (!e) continue;
      const t = prog[i];
      const b = Math.sin(t * Math.PI);

      pos[i * 3] = e.s.x + (e.t.x - e.s.x) * t + off[i * 2] * b;
      pos[i * 3 + 1] = e.s.y + (e.t.y - e.s.y) * t + off[i * 2 + 1] * b;
      pos[i * 3 + 2] = 0.08;
      opa[i] = b * 0.5;
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.aOpa.needsUpdate = true;
  });

  const V = `
    attribute float aOpa;
    varying float vO;
    void main() {
      vO = aOpa;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = 1.2 * (200.0 / -mv.z);
      gl_Position = projectionMatrix * mv;
    }
  `;
  const F = `
    varying float vO;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.4) discard;
      gl_FragColor = vec4(0.3, 0.82, 0.88, vO);
    }
  `;

  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial vertexShader={V} fragmentShader={F} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ─── FLOATING DATA READOUTS ─────────────────────────────────────── */

function DataReadouts() {
  const sprites = useMemo(() => {
    const rand = seededRandom(99);
    const items = [];
    for (let i = 0; i < 15; i++) {
      const x = (rand() - 0.5) * 26;
      const y = (rand() - 0.5) * 18;
      const v1 = Math.floor(rand() * 9000 + 1000);
      const v2 = Math.floor(rand() * 9000 + 1000);
      const c = document.createElement('canvas');
      c.width = 140;
      c.height = 20;
      const ctx = c.getContext('2d');
      if (!ctx) continue;
      ctx.font = '10px monospace';
      ctx.fillStyle = '#2a4045';
      ctx.fillText(v1 + ' - ' + v2, 2, 12);
      const tex = new THREE.CanvasTexture(c);
      tex.minFilter = THREE.LinearFilter;
      items.push(
        <sprite key={'r' + i} position={[x, y, -0.1]} scale={[1.4, 0.2, 1]}>
          <spriteMaterial map={tex} transparent opacity={0.4} depthWrite={false} />
        </sprite>,
      );
    }
    return items;
  }, []);
  return <>{sprites}</>;
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────── */

export default function NeuralNetworkGraph({
  width = '100%',
  height = '100%',
  className = '',
  style = {},
  nodes: _extNodes,
  edges: _extEdges,
}) {
  const { nodes, edges } = useMemo(() => generateGraph(), []);

  return (
    <div
      className={className}
      style={{
        width,
        height,
        background: '#030508',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid rgba(77,208,225,0.1)',
        position: 'relative',
        ...style,
      }}
    >
      {/* Ghost watermark */}
      <div style={{
        position: 'absolute', bottom: 16, right: 20,
        fontSize: 42, fontWeight: 900, letterSpacing: 6,
        color: 'rgba(255,255,255,0.02)', fontFamily: 'monospace',
        lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
      }}>
        NEURAL<br/>NETWORK
      </div>

      {/* Top-left HUD */}
      <div style={{
        position: 'absolute', top: 12, left: 14,
        fontFamily: 'monospace', fontSize: 9, lineHeight: 1.6,
        color: '#4dd0e1', opacity: 0.6, pointerEvents: 'none', zIndex: 1,
      }}>
        NEURAL NETWORK<br/>
        <span style={{ color: '#445566' }}>
          {edges.length} edges | {nodes.length} nodes
        </span><br/>
        <span style={{ color: '#445566' }}>
          3800 txns | 120 customers
        </span>
      </div>

      <Canvas
        camera={{ position: [1, -1, 26], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#030508']} />
        <ThinEdges nodes={nodes} edges={edges} />
        <FlowParticles nodes={nodes} edges={edges} />
        <NodeDots nodes={nodes} />
        <Labels nodes={nodes} />
        <DataReadouts />
      </Canvas>
    </div>
  );
}
