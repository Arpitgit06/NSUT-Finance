import { useEffect, useMemo, useRef, useState } from "react";
import NeuralNetworkGraph from "@/components/NeuralNetworkGraph";
import * as THREE from "three";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleAlert,
  CircleDollarSign,
  Clock3,
  Crosshair,
  Database,
  Eye,
  Fingerprint,
  Gauge,
  HandCoins,
  HeartHandshake,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Network,
  PanelLeft,
  Radar,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Users,
  WalletCards,
  X,
  Zap,
} from "lucide-react";

type View = "Overview" | "Alerts" | "Customers" | "Mule network" | "Loans" | "Evaluation" | "Cases" | "Fairness";
type AlertTier = "Critical" | "Watch" | "Nudge";
type CaseStatus = "Open" | "Contacted" | "Resolved";

type Alert = { id: string; type: string; customer: string; city: string; amount: string; tier: AlertTier; fraud: number; repayment: number; time: string; reasons: string[]; bridge: boolean };

const navItems: { label: View; icon: typeof Radar; meta?: string }[] = [
  { label: "Overview", icon: Radar }, { label: "Alerts", icon: Bell, meta: "32" }, { label: "Customers", icon: Users }, { label: "Mule network", icon: Network }, { label: "Loans", icon: CircleDollarSign }, { label: "Evaluation", icon: Target }, { label: "Cases", icon: BriefcaseBusiness, meta: "12" }, { label: "Fairness", icon: Fingerprint },
];

const alerts: Alert[] = [
  { id: "ALT-2418", type: "Impersonation", customer: "Ananya Menon", city: "Bengaluru", amount: "₹42,000", tier: "Critical", fraud: 86, repayment: 52, time: "01:40", reasons: ["Amount 38× typical", "Remote-access app active", "First-time payee looks like mule"], bridge: true },
  { id: "ALT-2417", type: "Phishing / takeover", customer: "Rohan Iyer", city: "Pune", amount: "₹18,500", tier: "Critical", fraud: 79, repayment: 28, time: "00:58", reasons: ["New device + rapid payments", "SIM swap in last 48 hours", "Night-hour velocity spike"], bridge: false },
  { id: "ALT-2416", type: "Unusual activity", customer: "Meera Shah", city: "Ahmedabad", amount: "₹8,900", tier: "Watch", fraud: 48, repayment: 41, time: "23:11", reasons: ["Unusual city", "First-time payee", "Spend over 90% of income"], bridge: true },
  { id: "ALT-2415", type: "Payment request", customer: "Sahil Nair", city: "Kochi", amount: "₹2,200", tier: "Nudge", fraud: 34, repayment: 22, time: "22:46", reasons: ["Repeated unsolicited collect", "Micro-test payment", "No baseline breach"], bridge: false },
];

const customers = [
  { name: "Ananya Menon", id: "CUS-0182", city: "Bengaluru", segment: "Emerging", fraud: 86, repayment: 52, runway: "0.6 mo", status: "Victim → default", color: "mint" },
  { name: "Rohan Iyer", id: "CUS-0197", city: "Pune", segment: "Salaried", fraud: 79, repayment: 28, runway: "2.3 mo", status: "Investigate", color: "amber" },
  { name: "Meera Shah", id: "CUS-0091", city: "Ahmedabad", segment: "Gig worker", fraud: 48, repayment: 41, runway: "1.1 mo", status: "Early distress", color: "violet" },
  { name: "Sahil Nair", id: "CUS-0224", city: "Kochi", segment: "Emerging", fraud: 34, repayment: 22, runway: "3.8 mo", status: "Watchlist", color: "coral" },
];

const loans = [
  { id: "LN-88214", customer: "Ananya Menon", product: "Personal loan", principal: "₹3.2L", emi: "₹9,500", due: "4 days", dpd: "0", risk: 52, runway: "0.6 mo", trend: "down" },
  { id: "LN-88177", customer: "Rohan Iyer", product: "Consumer durable", principal: "₹86,000", emi: "₹4,200", due: "11 days", dpd: "0", risk: 28, runway: "2.3 mo", trend: "flat" },
  { id: "LN-87420", customer: "Meera Shah", product: "Working capital", principal: "₹1.4L", emi: "₹6,800", due: "2 days", dpd: "3", risk: 41, runway: "1.1 mo", trend: "down" },
];

const caseSeed: { id: string; customer: string; issue: string; owner: string; status: CaseStatus; age: string }[] = [
  { id: "CASE-1042", customer: "Ananya Menon", issue: "Victim → default bridge", owner: "A. Rao", status: "Open", age: "8m" },
  { id: "CASE-1041", customer: "Rohan Iyer", issue: "New device takeover", owner: "M. Das", status: "Contacted", age: "34m" },
  { id: "CASE-1039", customer: "Meera Shah", issue: "Cash runway < 2 mo", owner: "S. Kapoor", status: "Open", age: "1h" },
  { id: "CASE-1033", customer: "Priya Kulkarni", issue: "Fake refund pattern", owner: "A. Rao", status: "Resolved", age: "3h" },
];

function Reveal({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { node.classList.add("is-visible"); observer.unobserve(node); } }, { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={style}>{children}</div>;
}

function ScoreChip({ label, value, tone }: { label: string; value: number; tone: "mint" | "coral" | "amber" | "violet" }) {
  return <div className={`score-chip ${tone}`}><span>{label}</span><strong>{value}</strong><i style={{ width: `${value}%` }} /></div>;
}

function TierBadge({ tier }: { tier: AlertTier | CaseStatus }) { return <span className={`tier-badge ${tier.toLowerCase()}`}><span />{tier}</span>; }

function MetricCard({ label, value, delta, icon: Icon, tone }: { label: string; value: string; delta: string; icon: typeof Activity; tone: string }) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}><Icon size={16} /></div><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className={`metric-delta ${delta.startsWith("-") ? "positive" : ""}`}>{delta.startsWith("-") ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}{delta}</div></div>;
}

function DNAHelix({ sceneIndex, scrollProgress }: { sceneIndex: number; scrollProgress: number }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef(sceneIndex);
  const scrollRef = useRef(scrollProgress);
  const audioRef = useRef<AudioContext | null>(null);
  useEffect(() => { scrollRef.current = scrollProgress; }, [scrollProgress]);
  const expansion = Math.min(1, Math.max(0, (scrollProgress - 18) / 72));
  const portalFade = Math.min(.66, Math.max(.24, .24 + expansion * .42));
  const portalActive = expansion > .02;
  useEffect(() => { phaseRef.current = sceneIndex; }, [sceneIndex]);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.15, 7.2);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    const helix = new THREE.Group();
    scene.add(helix);
    const basePairTargets: THREE.Object3D[] = [];
    const bursts: Array<{ points: THREE.Points; velocities: THREE.Vector3[]; age: number }> = [];
    const orange = new THREE.MeshPhysicalMaterial({ color: 0xf29d32, emissive: 0x4f1f05, emissiveIntensity: 1.15, metalness: .22, roughness: .25, clearcoat: .7, clearcoatRoughness: .18 });
    const ivory = new THREE.MeshPhysicalMaterial({ color: 0xe9d8bf, emissive: 0x3d2a1c, emissiveIntensity: .68, metalness: .16, roughness: .28, clearcoat: .8, clearcoatRoughness: .14 });
    const cyan = new THREE.MeshPhysicalMaterial({ color: 0x5ed8eb, emissive: 0x0b4c62, emissiveIntensity: 1.25, metalness: .25, roughness: .2, clearcoat: .5 });
    const amber = new THREE.MeshPhysicalMaterial({ color: 0xffc34f, emissive: 0x5b2b05, emissiveIntensity: 1.1, metalness: .26, roughness: .2, clearcoat: .6 });
    const pink = new THREE.MeshPhysicalMaterial({ color: 0xf58b91, emissive: 0x5c151e, emissiveIntensity: 1.05, metalness: .24, roughness: .24, clearcoat: .55 });
    const tube = (points: THREE.Vector3[], radius: number, material: THREE.Material) => {
      const curve = new THREE.CatmullRomCurve3(points);
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 180, radius, 10, false), material);
      helix.add(mesh);
    };
    const pointsA: THREE.Vector3[] = [];
    const pointsB: THREE.Vector3[] = [];
    const turns = 2.8;
    const samples = 54;
    for (let i = 0; i <= samples; i += 1) {
      const t = (i / samples) * Math.PI * 2 * turns - Math.PI * turns;
      const y = (i / samples - .5) * 4.5;
      pointsA.push(new THREE.Vector3(Math.cos(t) * 1.18, y, Math.sin(t) * 1.18));
      pointsB.push(new THREE.Vector3(Math.cos(t + Math.PI) * 1.18, y, Math.sin(t + Math.PI) * 1.18));
    }
    tube(pointsA, .11, orange);
    tube(pointsB, .11, ivory);
    tube(pointsA.map(point => point.clone().multiplyScalar(.96)), .028, amber);
    tube(pointsB.map(point => point.clone().multiplyScalar(.96)), .028, cyan);
    const energyMaterial = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(0x66f2d8) }, uWarmth: { value: new THREE.Color(0xff8a34) } },
      vertexShader: `varying vec3 vNormal; varying vec3 vPosition; void main() { vNormal = normalize(normalMatrix * normal); vPosition = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform float uTime; uniform vec3 uColor; uniform vec3 uWarmth; varying vec3 vNormal; varying vec3 vPosition; void main() { float facing = pow(1.0 - max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0), 2.6); float pulse = 0.6 + 0.4 * sin(uTime * 2.4 + vPosition.y * 6.0); float heat = smoothstep(-0.35, 0.35, sin(uTime * 1.2 + vPosition.y * 3.0)); vec3 color = mix(uColor, uWarmth, heat * 0.42); gl_FragColor = vec4(color * (0.45 + facing * 1.8) * pulse, (0.08 + facing * 0.72) * pulse); }`,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const energyCore = new THREE.Mesh(new THREE.SphereGeometry(.34, 32, 32), energyMaterial);
    energyCore.position.y = .05;
    helix.add(energyCore);
    const energyRing = new THREE.Mesh(new THREE.TorusGeometry(.62, .018, 8, 64), energyMaterial);
    energyRing.rotation.x = Math.PI / 2;
    helix.add(energyRing);
    const up = new THREE.Vector3(0, 1, 0);
    const rungMaterials = [cyan, amber, pink, ivory];
    for (let i = 3; i < samples - 2; i += 2) {
      const a = pointsA[i];
      const b = pointsB[i];
      const direction = new THREE.Vector3().subVectors(b, a);
      const midpoint = new THREE.Vector3().addVectors(a, b).multiplyScalar(.5);
      const rung = new THREE.Mesh(new THREE.CylinderGeometry(.032, .032, direction.length(), 8), rungMaterials[(i / 2) % rungMaterials.length]);
      rung.position.copy(midpoint);
      rung.quaternion.setFromUnitVectors(up, direction.normalize());
      helix.add(rung);
      const leftNode = new THREE.Mesh(new THREE.SphereGeometry(.105, 14, 14), rungMaterials[(i / 2) % rungMaterials.length]);
      leftNode.position.copy(a);
      const rightNode = new THREE.Mesh(new THREE.SphereGeometry(.105, 14, 14), rungMaterials[(i / 2 + 1) % rungMaterials.length]);
      rightNode.position.copy(b);
      leftNode.userData.basePair = Math.floor(i / 2);
      rightNode.userData.basePair = Math.floor(i / 2);
      helix.add(leftNode, rightNode);
      basePairTargets.push(leftNode, rightNode);
    }
    const satelliteMaterials = [cyan, amber, pink, ivory];
    for (let i = 0; i < 28; i += 1) {
      const t = (i / 28) * Math.PI * 2 * turns - Math.PI * turns;
      const y = ((i / 27) - .5) * 4.9;
      const radius = 1.75 + (i % 3) * .15;
      const satellite = new THREE.Mesh(new THREE.SphereGeometry(.075 + (i % 4) * .018, 10, 10), satelliteMaterials[i % satelliteMaterials.length]);
      satellite.position.set(Math.cos(t * 1.4) * radius, y, Math.sin(t * 1.4) * radius);
      helix.add(satellite);
    }
    const playBasePairSound = (pair: number) => {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const context = audioRef.current ?? new AudioContextClass();
      audioRef.current = context;
      void context.resume();
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const shimmer = context.createOscillator();
      const gain = context.createGain();
      const shimmerGain = context.createGain();
      oscillator.type = "sine";
      shimmer.type = "triangle";
      oscillator.frequency.setValueAtTime(360 + (pair % 8) * 16, now);
      oscillator.frequency.exponentialRampToValueAtTime(760 + (pair % 5) * 22, now + .16);
      shimmer.frequency.setValueAtTime(920 + (pair % 6) * 30, now);
      shimmer.frequency.exponentialRampToValueAtTime(1440, now + .11);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.07, now + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, now + .22);
      shimmerGain.gain.setValueAtTime(.0001, now);
      shimmerGain.gain.exponentialRampToValueAtTime(.025, now + .01);
      shimmerGain.gain.exponentialRampToValueAtTime(.0001, now + .13);
      oscillator.connect(gain).connect(context.destination);
      shimmer.connect(shimmerGain).connect(context.destination);
      oscillator.start(now); shimmer.start(now);
      oscillator.stop(now + .24); shimmer.stop(now + .15);
    };
    const emitBurst = (anchor: THREE.Object3D) => {
      const count = 28;
      const positions = new Float32Array(count * 3);
      const velocities: THREE.Vector3[] = [];
      for (let i = 0; i < count; i += 1) {
        velocities.push(new THREE.Vector3((Math.random() - .5) * .055, (Math.random() - .5) * .055, (Math.random() - .5) * .055));
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({ color: 0x9fffee, size: .075, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
      const points = new THREE.Points(geometry, material);
      points.position.copy(anchor.position);
      helix.add(points);
      bursts.push({ points, velocities, age: 0 });
      playBasePairSound(anchor.userData.basePair as number);
      toast("Base pair activated", { description: `Signal pair ${String(anchor.userData.basePair).padStart(2, "0")} emitted a local burst` });
    };
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const handlePointerDown = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(basePairTargets, false)[0];
      if (hit?.object) { emitBurst(hit.object); return; }
      const nearest = basePairTargets.reduce<{ target: THREE.Object3D | null; distance: number }>((best, target) => {
        const projected = target.getWorldPosition(new THREE.Vector3()).project(camera);
        const screenX = rect.left + ((projected.x + 1) / 2) * rect.width;
        const screenY = rect.top + ((1 - projected.y) / 2) * rect.height;
        const distance = Math.hypot(event.clientX - screenX, event.clientY - screenY);
        return distance < best.distance ? { target, distance } : best;
      }, { target: null, distance: 42 });
      if (nearest.target) emitBurst(nearest.target);
    };
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    const keyLight = new THREE.PointLight(0x9fffee, 3.2, 13, 2); keyLight.position.set(-3.4, 2.8, 4.5); scene.add(keyLight);
    const warmLight = new THREE.PointLight(0xff8a32, 2.8, 11, 2); warmLight.position.set(3.4, -1.5, 3.6); scene.add(warmLight);
    const rimLight = new THREE.PointLight(0x7e9cff, 2.1, 10, 2); rimLight.position.set(-2.6, -2.5, -2.5); scene.add(rimLight);
    scene.add(new THREE.HemisphereLight(0xaad9ff, 0x2b1208, 1.35));
    const resize = () => { const width = mount.clientWidth || 320; const height = mount.clientHeight || 320; renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(mount); resize();
    let frame = 0;
    const animate = (time: number) => {
      frame = requestAnimationFrame(animate);
      const phase = phaseRef.current;
      const page = Math.min(1, Math.max(0, scrollRef.current / 100));
      const expansion = Math.min(1, Math.max(0, (scrollRef.current - 18) / 72));
      const smooth = (value: number) => value * value * (3 - 2 * value);
      const segment = (from: number, to: number, start: number, end: number) => smooth(Math.min(1, Math.max(0, (page - start) / (end - start))));
      const descend = segment(0, 1, 0, .2);
      const inspect = segment(0, 1, .2, .4);
      const flip = segment(0, 1, .4, .6);
      const sideLock = segment(0, 1, .6, 1);
      const scrollYaw = descend * Math.PI * .5 + inspect * Math.PI * .18 + flip * Math.PI + sideLock * Math.PI * .18;
      const focusY = descend * -.72 + inspect * -.28 + flip * .42 + sideLock * .25;
      const focusX = descend * .22 - inspect * .42 + flip * .5 - sideLock * .34;
      const macroBreath = Math.sin(time * .00016) * .045;
      helix.rotation.y += (time * .00012 + scrollYaw - helix.rotation.y) * .08;
      helix.rotation.x += (macroBreath + descend * .16 - flip * .1 - helix.rotation.x) * .08;
      helix.rotation.z += (Math.sin(time * .00011) * .018 + sideLock * .24 - helix.rotation.z) * .08;
      energyMaterial.uniforms.uTime.value = time * .001;
      energyMaterial.uniforms.uColor.value.lerp(new THREE.Color(0x66f2d8).lerp(new THREE.Color(0x5ed8eb), flip), .035);
      energyMaterial.uniforms.uWarmth.value.lerp(new THREE.Color(0xff8a34).lerp(new THREE.Color(0xf45f63), flip), .035);
      bursts.forEach((burst, burstIndex) => {
        burst.age += .028;
        const positions = burst.points.geometry.getAttribute("position") as THREE.BufferAttribute;
        burst.velocities.forEach((velocity, index) => { positions.setXYZ(index, positions.getX(index) + velocity.x, positions.getY(index) + velocity.y, positions.getZ(index) + velocity.z); });
        positions.needsUpdate = true;
        (burst.points.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - burst.age);
        if (burst.age >= 1) { helix.remove(burst.points); burst.points.geometry.dispose(); (burst.points.material as THREE.PointsMaterial).dispose(); bursts.splice(burstIndex, 1); }
      });
      const targetScale = (1 + descend * .08 + inspect * .34 - flip * .08 + sideLock * .12) * (1 + expansion * .18);
      const currentScale = helix.scale.x;
      const nextScale = currentScale + (targetScale - currentScale) * .055;
      helix.scale.setScalar(nextScale);
      // A weighted camera arm: wide context, macro node inspection, pull-back/flip, then side-profile lock.
      const targetX = focusX;
      const targetY = .15 + focusY;
      const targetZ = 7.2 - descend * 1.35 - inspect * .75 + flip * 1.1 + sideLock * .55 + expansion * 4.0;
      camera.position.x += (targetX - camera.position.x) * .055;
      camera.position.y += (targetY - camera.position.y) * .055;
      camera.position.z += (targetZ - camera.position.z) * .055;
      camera.lookAt(focusX * .18, focusY, 0);
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); resizeObserver.disconnect(); renderer.domElement.removeEventListener("pointerdown", handlePointerDown); bursts.forEach(burst => { burst.points.geometry.dispose(); (burst.points.material as THREE.PointsMaterial).dispose(); }); renderer.dispose(); mount.removeChild(renderer.domElement); helix.traverse(object => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); if (Array.isArray(object.material)) object.material.forEach(material => material.dispose()); else object.material.dispose(); } }); };
  }, [portalActive]);
  const dnaStyle = { "--dna-expansion": expansion, "--dna-scale": .9 + expansion * 1.15, "--dna-y": `${-18 - expansion * 44}px`, "--dna-scale-mobile": .66 + expansion * .68, "--dna-y-mobile": `${-28 - expansion * 22}px`, "--dna-full-scale": .98 + expansion * .04, "--dna-full-opacity": portalFade * .66 } as React.CSSProperties;
  const emitter = <div className={`dna-emitter ${portalActive ? "dna-fullscreen" : ""}`} style={dnaStyle} aria-label="True 3D double-stranded risk DNA helix"><div className="dna-energy-bloom" /><div className="dna-orbit orbit-x" /><div className="dna-orbit orbit-y" /><div ref={mountRef} className="dna-webgl" /><div className="dna-readout"><span className="dna-readout-dot" />FOCUS NODE <b>03 / 09</b></div></div>;
  return portalActive && typeof document !== "undefined" ? createPortal(emitter, document.body) : emitter;
}

function RiskCore({ scrollProgress }: { scrollProgress: number }) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const scenes = [
    { phase: "SCAN", code: "MACRO RISK SWEEP", cards: [{ title: "PORTFOLIO SURFACE", value: "3,800+", detail: "transactions watched" }, { title: "SIGNAL DENSITY", value: "12.4%", detail: "above baseline" }, { title: "RUN 07", value: "LIVE", detail: "synthetic stream" }] },
    { phase: "DESIGN", code: "BRIDGE NODE ISOLATED", cards: [{ title: "BRIDGE NODE", value: "ALT-2418", detail: "victim → default" }, { title: "FRAUD / REPAYMENT", value: "86 / 52", detail: "twin score pair" }, { title: "ANCHOR", value: "BENGALURU", detail: "first-time payee" }] },
    { phase: "SYNTH", code: "MUTATION TRACKING", cards: [{ title: "MUTATION", value: "PAYEE X", detail: "mule confidence 87" }, { title: "CASH RUNWAY", value: "0.6 MO", detail: "under support threshold" }, { title: "INTERVENTION", value: "HOLD", detail: "no penalty applied" }] },
    { phase: "DECON", code: "DECONSTRUCTING SIGNAL", cards: [{ title: "FIRST DOSE CLEAN", value: "08:42", detail: "safe repayment path" }, { title: "BACKBONE SCAN", value: "03", detail: "reason trail points" }, { title: "NEXT ACTION", value: "NUDGE", detail: "support before collect" }] },
  ] as const;
  const scene = scenes[sceneIndex];
  const tetherPaths = [
    ["M 440 255 C 350 205 245 170 126 154", "M 505 278 C 630 228 752 190 866 162", "M 452 314 C 360 342 265 358 144 351"],
    ["M 484 245 C 370 198 270 168 116 178", "M 524 269 C 645 218 768 198 875 198", "M 486 318 C 365 358 250 382 124 371"],
    ["M 468 233 C 351 195 248 154 112 140", "M 548 286 C 680 258 775 262 883 288", "M 485 330 C 363 377 253 397 138 392"],
    ["M 455 261 C 350 225 260 206 122 221", "M 545 252 C 674 196 775 163 885 154", "M 505 326 C 397 374 279 404 155 407"],
  ][sceneIndex];
  useEffect(() => {
    const updatePhaseFromScroll = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const start = stage.offsetTop - window.innerHeight * .08;
      const end = start + stage.offsetHeight + window.innerHeight * .62;
      const progress = Math.max(0, Math.min(0.999, (window.scrollY - start) / Math.max(1, end - start)));
      setStageProgress(progress * 100);
      const nextPhase = Math.min(scenes.length - 1, Math.floor(progress * scenes.length));
      setSceneIndex(current => current === nextPhase ? current : nextPhase);
    };
    updatePhaseFromScroll();
    window.addEventListener("scroll", updatePhaseFromScroll, { passive: true });
    window.addEventListener("resize", updatePhaseFromScroll);
    return () => { window.removeEventListener("scroll", updatePhaseFromScroll); window.removeEventListener("resize", updatePhaseFromScroll); };
  }, [scenes.length]);
  const normalizedStage = Math.min(1, Math.max(0, stageProgress / 100));
  const cardDrift = Math.sin(normalizedStage * Math.PI * 2) * 8;
  const stageStyle = { "--stage-progress": `${stageProgress}%`, "--focal-drift": `${cardDrift}px`, "--focal-pull": `${Math.round(normalizedStage * 18)}px` } as React.CSSProperties;
  return <div ref={stageRef} style={stageStyle} className={`risk-stage stage-scene-${sceneIndex}`} aria-label="Spatial KAVACH risk analysis HUD"><div className="stage-grid" /><div className="stage-vignette" /><div className="process-strip"><span className="run-id">RUN 07 / KAVACH</span><div className="process-track">{["SCAN", "DESIGN", "SYNTH", "DECON"].map((phase, index) => <span key={phase} className={index === sceneIndex ? "active" : index < sceneIndex ? "done" : ""}><i />{phase}</span>)}</div><span className="process-time">12:54:26 <b>●</b></span><span className="process-hint">SCROLL / FOCUS</span></div><div className="signal-caption top"><span className="live-dot" />LIVE / SYNTHETIC STREAM <em>·</em> {scene.code}</div><svg className="tether-lines" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">{tetherPaths.map((path, index) => <path key={path} className={`tether tether-${index + 1}`} d={path} />)}</svg><div className="risk-core-wrap"><div className="risk-glow" /><DNAHelix sceneIndex={sceneIndex} scrollProgress={scrollProgress} /></div><div className="spatial-callouts">{scene.cards.map((card, index) => <div className={`spatial-callout callout-${index + 1}`} style={{ "--card-drift": `${cardDrift * (index === 1 ? -1.15 : index === 2 ? .72 : .9)}px`, "--card-lift": `${-Math.abs(cardDrift) * (index + 1) * .22}px`, "--card-delay": `${index * 90 + Math.round(normalizedStage * 120)}ms` } as React.CSSProperties} key={`${scene.phase}-${card.title}`}><span className="callout-index">0{index + 1}</span><span className="panel-kicker">{card.title}</span><b>{card.value}</b><small>{card.detail}</small></div>)}</div><div className="emission-readout"><span className="emission-bar" /><span>EMISSION FIELD</span><b>ACTIVE</b></div><div className="stage-dock"><div className="dock-panel affinity-dock"><span className="dock-label">AFFINITY / TOXICITY</span><svg viewBox="0 0 160 44" preserveAspectRatio="none"><path d="M4 37 C22 32 20 13 39 25 S67 35 78 16 S102 8 113 20 S139 33 156 7" /><circle cx="113" cy="20" r="3" /></svg><small>protected zone <b>92%</b></small></div><div className="dock-panel load-dock"><span className="dock-label">SYNTH LOAD</span><div className="load-bars">{[45, 62, 38, 82, 57, 70].map((height, index) => <i key={index} style={{ height: `${height}%`, "--delay": `${index * .12}s` } as React.CSSProperties} />)}</div><small>processing <b>68%</b></small></div><div className="dock-panel plate-dock"><span className="dock-label">SIGNAL PLATE / {scene.phase} <b>· 06×10</b></span><div className="plate-grid">{Array.from({ length: 30 }, (_, index) => <i key={index} className={index === (sceneIndex * 7 + 4) % 30 ? "hot" : index % 11 === 0 ? "warn" : ""} />)}</div><small>anchor <b>{sceneIndex === 1 ? "B12" : sceneIndex === 2 ? "D08" : "A03"}</b></small></div></div><div className="signal-caption bottom"><span>3,800+</span> transactions watched <em>·</em> <span>120</span> customers</div><div className="orbit-label l-one"><Crosshair size={12} /> fraud signal</div><div className="orbit-label l-two"><HandCoins size={12} /> repayment signal</div><div className="orbit-label l-three"><LinkGlyph /> bridge detected</div></div>;
}

function LinkGlyph() { return <span className="link-glyph">↗</span>; }

function Sparkline({ tone = "mint" }: { tone?: string }) {
  return <svg className={`sparkline ${tone}`} viewBox="0 0 220 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 43 C18 45 22 26 39 31 S58 47 76 35 S96 18 110 28 S132 44 146 27 S170 15 184 22 S202 30 220 10" /><path className="spark-fill" d="M0 43 C18 45 22 26 39 31 S58 47 76 35 S96 18 110 28 S132 44 146 27 S170 15 184 22 S202 30 220 10 V60 H0 Z" /></svg>;
}

function CinematicSpace({ progress }: { progress: number }) {
  const style = {
    "--space-x": `${Math.sin(progress / 18) * 18}px`,
    "--space-y": `${progress * 0.28}px`,
    "--space-rotate": `${progress * 0.06 - 3}deg`,
    "--space-opacity": `${0.62 + Math.min(progress, 100) * 0.002}`,
  } as React.CSSProperties;
  return <div className="ambient-space" style={style} aria-hidden="true"><div className="space-cloud" /><div className="space-planet" /><div className="space-orbit orbit-a" /><div className="space-orbit orbit-b" /><div className="space-scanline" />{Array.from({ length: 14 }, (_, index) => <i key={index} className={`space-particle space-particle-${index + 1}`} />)}</div>;
}

function SignalDeck({ progress }: { progress: number }) {
  const style = {
    "--deck-shift": `${Math.min(progress, 100) * 0.32}px`,
    "--deck-tilt": `${Math.sin(progress / 13) * 2.5}deg`,
  } as React.CSSProperties;
  return <Reveal className="signal-deck-wrap" style={style}><div className="signal-deck-3d"><div className="deck-plane plane-back" /><div className="deck-plane plane-front" /><div className="deck-trace trace-one" /><div className="deck-trace trace-two" /><div className="deck-card deck-card-left"><span className="deck-number">01</span><span className="panel-kicker">FRAUD SIGNAL</span><b>payee velocity</b><small>+25 weighted evidence</small></div><div className="deck-card deck-card-center"><span className="deck-number">K</span><span className="panel-kicker">BRIDGE LAYER</span><b>protective hold</b><small>support before collections</small></div><div className="deck-card deck-card-right"><span className="deck-number">02</span><span className="panel-kicker">REPAYMENT SIGNAL</span><b>cash runway</b><small>0.6 months remaining</small></div><div className="deck-orb"><span /><i /><b>LIVE</b></div><div className="deck-caption"><span className="live-dot" /> SCROLL TO TRAVERSE THE SIGNAL STACK <em>·</em> <b>03 layers</b></div></div></Reveal>;
}

function Overview({ onNavigate, onSelectAlert, selectedAlert, scrollProgress }: { onNavigate: (view: View) => void; onSelectAlert: (alert: Alert) => void; selectedAlert: Alert; scrollProgress: number }) {
  return <div className="view-stack">
    <Reveal className="hero-grid"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line" /> RISK OPERATIONS / 03 OCT 2026</div><h1>Protect the customer.<br /><em>Collect second.</em></h1><p className="hero-deck">Scams and financial distress are the same story. KAVACH reads them together, so a missed EMI can trigger support—not a penalty.</p><div className="hero-actions"><button className="button primary" onClick={() => onNavigate("Alerts")}><Radar size={15} /> Review high-risk alerts <ChevronRight size={14} /></button><button className="text-button" onClick={() => onNavigate("Evaluation")}><SlidersHorizontal size={14} /> Tune thresholds</button></div><div className="hero-note"><ShieldCheck size={14} /> Reason trail available for every score</div></div><RiskCore scrollProgress={scrollProgress} /></Reveal>
    <Reveal className="metric-row"><MetricCard label="Customers watched" value="120" delta="+8.2%" icon={Users} tone="mint" /><MetricCard label="Protected this week" value="₹18.4L" delta="+14.6%" icon={ShieldCheck} tone="amber" /><MetricCard label="Open risk alerts" value="32" delta="-12.3%" icon={Bell} tone="coral" /><MetricCard label="Median intervention" value="11m" delta="-3.8m" icon={Clock3} tone="violet" /></Reveal>
    <Reveal className="section-header split"><div><div className="eyebrow"><span className="eyebrow-line" /> TWIN SCORE ENGINE</div><h2>Two signals. One safer decision.</h2></div><span className="section-meta"><span className="live-dot" /> Model v2.4 / calibrated on labels</span></Reveal>
    <Reveal className="twin-grid"><div className="panel score-panel fraud-panel"><div className="panel-top"><div><span className="panel-kicker">01 / FRAUD RISK</span><h3>Is this payment a scam?</h3></div><div className="big-score">55<span>/100</span></div></div><div className="score-progress"><span style={{ width: "55%" }} /></div><div className="signal-list"><div><span className="dot coral" />Payee looks like mule <b>25</b></div><div><span className="dot coral" />Remote-access app active <b>25</b></div><div><span className="dot amber" />First-time payee <b>15</b></div></div><button className="panel-link" onClick={() => onNavigate("Alerts")}>View explainable alerts <ChevronRight size={14} /></button></div><div className="bridge-connector"><div className="connector-dot" /><span>victim → default bridge</span><div className="connector-line" /><ArrowDownRight size={18} /></div><div className="panel score-panel repayment-panel"><div className="panel-top"><div><span className="panel-kicker">02 / REPAYMENT RISK</span><h3>Can this customer cover the EMI?</h3></div><div className="big-score mint-score">52<span>/100</span></div></div><div className="score-progress mint"><span style={{ width: "52%" }} /></div><div className="signal-list"><div><span className="dot mint" />EMI due in 4 days, low balance <b>12</b></div><div><span className="dot coral" />Scam loss this month <b>22</b></div><div><span className="dot violet" />Cash runway under 2 mo <b>10</b></div></div><button className="panel-link" onClick={() => onNavigate("Loans")}>Open loan context <ChevronRight size={14} /></button></div></Reveal>
    <SignalDeck progress={scrollProgress} />
    <Reveal className="section-header split"><div><div className="eyebrow"><span className="eyebrow-line" /> PRIORITY QUEUE</div><h2>Signals worth a human minute.</h2></div><button className="text-button" onClick={() => onNavigate("Alerts")}>Open all 32 alerts <ChevronRight size={14} /></button></Reveal>
    <Reveal className="alert-layout"><div className="panel alert-table-panel"><div className="table-head"><span>Alert / customer</span><span>Twin scores</span><span>Detected</span><span>Action</span></div>{alerts.slice(0, 3).map((alert, index) => <button className={`alert-row ${selectedAlert.id === alert.id ? "selected" : ""}`} key={alert.id} onClick={() => onSelectAlert(alert)} style={{ "--delay": `${index * 0.08}s` } as React.CSSProperties}><div className="alert-identity"><span className={`alert-mark ${alert.tier.toLowerCase()}`}><CircleAlert size={14} /></span><span><b>{alert.type}</b><small>{alert.customer} · {alert.city}</small></span></div><div className="row-scores"><ScoreChip label="F" value={alert.fraud} tone="coral" /><ScoreChip label="R" value={alert.repayment} tone="mint" /></div><div className="row-time"><b>{alert.time}</b><small>2 mins ago</small></div><div className="row-action"><TierBadge tier={alert.tier} /><ChevronRight size={15} /></div></button>)}</div><div className="panel incident-panel"><div className="panel-top"><div><span className="panel-kicker">SELECTED INCIDENT</span><h3>{selectedAlert.customer}</h3></div><span className="case-tag">{selectedAlert.id}</span></div><p className="incident-amount">{selectedAlert.amount} <span>at {selectedAlert.time}</span></p><div className="incident-context"><div><span>Fraud score</span><b className="coral-text">{selectedAlert.fraud}</b></div><div><span>Repayment score</span><b className="mint-text">{selectedAlert.repayment}</b></div><div><span>Bridge</span><b>{selectedAlert.bridge ? "Detected" : "Clear"}</b></div></div><div className="reason-trail"><div className="trail-heading"><span>WHY THIS ALERT?</span><span>POINT TRAIL</span></div>{selectedAlert.reasons.map(reason => <div className="trail-item" key={reason}><Check size={13} />{reason}<b>+{reason.includes("38×") ? "25" : reason.includes("app") ? "25" : "15"}</b></div>)}</div><button className="button dark-action" onClick={() => onNavigate("Alerts")}>Investigate incident <ChevronRight size={14} /></button></div></Reveal>
    <Reveal className="lower-grid"><div className="panel trend-panel"><div className="panel-top"><div><span className="panel-kicker">LAST 7 DAYS</span><h3>Scam loss vs. protected</h3></div><span className="trend-positive"><ArrowUpRight size={14} /> 31%</span></div><Sparkline /><div className="trend-legend"><span><i className="legend-dot mint" /> Protected <b>₹18.4L</b></span><span><i className="legend-dot coral" /> Lost <b>₹3.1L</b></span></div></div><div className="panel runway-panel"><div className="panel-top"><div><span className="panel-kicker">CASH RUNWAY</span><h3>Customers near the edge</h3></div><Gauge size={17} className="panel-icon" /></div><div className="runway-number">14 <span>customers under 2 months</span></div><div className="mini-bars">{[28, 42, 32, 54, 48, 76, 67, 92, 61, 78, 85, 70].map((height, index) => <span key={index} style={{ height: `${height}%`, "--delay": `${index * 0.06}s` } as React.CSSProperties} />)}</div><button className="panel-link" onClick={() => onNavigate("Customers")}>Review vulnerable customers <ChevronRight size={14} /></button></div><div className="panel case-mini-panel"><div className="panel-top"><div><span className="panel-kicker">CASE WORKFLOW</span><h3>Resolution pulse</h3></div><BriefcaseBusiness size={17} className="panel-icon" /></div><div className="case-counts"><div><b>12</b><span>Open</span></div><div><b>07</b><span>Contacted</span></div><div><b>19</b><span>Resolved</span></div></div><div className="case-bar"><span style={{ width: "32%" }} /><span style={{ width: "18%" }} /><span style={{ width: "50%" }} /></div><button className="panel-link" onClick={() => onNavigate("Cases")}>Open case workflow <ChevronRight size={14} /></button></div></Reveal>
  </div>;
}

function AlertsView({ selectedAlert, setSelectedAlert, onNavigate }: { selectedAlert: Alert; setSelectedAlert: (alert: Alert) => void; onNavigate: (view: View) => void }) {
  const [filter, setFilter] = useState<AlertTier | "All">("All");
  const [actions, setActions] = useState<string[]>([]);
  const filtered = filter === "All" ? alerts : alerts.filter(alert => alert.tier === filter);
  const runAction = (label: string) => {
    setActions(current => current.includes(label) ? current : [...current, label]);
    toast.success(`${label} logged`, { description: `${selectedAlert.customer} · synthetic case ${selectedAlert.id}` });
  };
  return <div className="view-stack"><Reveal className="page-intro split"><div><div className="eyebrow"><span className="eyebrow-line" /> ALERTS / TIERED RESPONSE</div><h1>Decide with the trail visible.</h1><p>High scores hold. Mid scores nudge. Every reason is legible before a human acts.</p></div><div className="intro-stat"><span>32</span><small>active alerts</small></div></Reveal><Reveal className="filter-bar"><div className="filter-title"><ListGlyph /> Queue filters</div>{(["All", "Critical", "Watch", "Nudge"] as const).map(item => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}<span>{item === "All" ? 32 : item === "Critical" ? 18 : item === "Watch" ? 9 : 5}</span></button>)}<div className="filter-spacer" /><button className="icon-button" onClick={() => toast("Queue refreshed", { description: "Synthetic stream is current" })}><RefreshCw size={15} /></button></Reveal><Reveal className="workspace-two-col"><div className="panel list-panel"><div className="table-head"><span>Signal</span><span>Twin scores</span><span>Detected</span><span>Tier</span></div>{filtered.map(alert => <button key={alert.id} className={`alert-row ${selectedAlert.id === alert.id ? "selected" : ""}`} onClick={() => setSelectedAlert(alert)}><div className="alert-identity"><span className={`alert-mark ${alert.tier.toLowerCase()}`}><CircleAlert size={14} /></span><span><b>{alert.type}</b><small>{alert.customer} · {alert.city}</small></span></div><div className="row-scores"><ScoreChip label="F" value={alert.fraud} tone="coral" /><ScoreChip label="R" value={alert.repayment} tone="mint" /></div><div className="row-time"><b>{alert.time}</b><small>{alert.amount}</small></div><div className="row-action"><TierBadge tier={alert.tier} /><ChevronRight size={15} /></div></button>)}</div><div className="panel detail-panel"><div className="panel-top"><div><span className="panel-kicker">REASON TRAIL / {selectedAlert.id}</span><h2>{selectedAlert.customer}</h2></div><TierBadge tier={selectedAlert.tier} /></div><div className="detail-meta"><span><span className="tiny-pin">⌖</span> {selectedAlert.city}</span><span><WalletCards size={13} /> {selectedAlert.amount}</span><span><Clock3 size={13} /> {selectedAlert.time}</span></div><div className="dual-score-large"><div><span>Fraud</span><b className="coral-text">{selectedAlert.fraud}</b><div className="score-progress"><span style={{ width: `${selectedAlert.fraud}%` }} /></div></div><div><span>Repayment</span><b className="mint-text">{selectedAlert.repayment}</b><div className="score-progress mint"><span style={{ width: `${selectedAlert.repayment}%` }} /></div></div></div><div className="signal-evidence"><div className="trail-heading"><span>POINT-BY-POINT EVIDENCE</span><span>WEIGHT</span></div>{selectedAlert.reasons.map((reason, index) => <div className="evidence-row" key={reason}><div><span className={`evidence-icon ${index === 1 ? "mint" : "coral"}`}>{index === 1 ? <LockKeyhole size={13} /> : <Zap size={13} />}</span><span><b>{reason}</b><small>{index === 0 ? "Deviation from customer baseline" : index === 1 ? "Device and session signal" : "Relationship graph signal"}</small></span></div><strong>+{index === 0 ? 25 : index === 1 ? 25 : 15}</strong></div>)}</div><div className="action-grid"><button className="button primary" onClick={() => runAction("Funds recall")}><HandCoins size={14} /> Recall funds</button><button className="button outline" onClick={() => runAction("Payee block")}><LockKeyhole size={14} /> Block payee</button><button className="button outline" onClick={() => runAction("Customer nudge")}><MessageSquareText size={14} /> Draft nudge</button><button className="button outline" onClick={() => { onNavigate("Cases"); toast("Case opened", { description: `${selectedAlert.id} moved into the case workflow` }); }}><BriefcaseBusiness size={14} /> Open case</button></div><div className="protect-note"><ShieldCheck size={15} /><span><b>Protective default</b> — no penalty applied while the victim-to-default bridge is under review.</span></div>{actions.length > 0 && <div className="action-state"><Check size={13} /><span><b>Logged in synthetic state:</b> {actions.join(" · ")}</span></div>}</div></Reveal></div>;
}

function ListGlyph() { return <span className="list-glyph"><i /><i /><i /></span>; }

function CustomersView({ onNavigate }: { onNavigate: (view: View) => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(customers[0]);
  const filtered = customers.filter(customer => `${customer.name} ${customer.id} ${customer.city}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="view-stack"><Reveal className="page-intro"><div><div className="eyebrow"><span className="eyebrow-line" /> CUSTOMER CONTEXT / SYNTHETIC PROFILES</div><h1>See the person behind the score.</h1><p>Personal baselines, cash runway, scam loss, and repayment history—one timeline.</p></div></Reveal><Reveal className="workspace-two-col customer-layout"><div className="panel list-panel"><div className="search-box"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search customer, ID, or city" /></div>{filtered.map(customer => <button className={`customer-row ${selected.id === customer.id ? "selected" : ""}`} key={customer.id} onClick={() => setSelected(customer)}><span className={`avatar ${customer.color}`}>{customer.name.split(" ").map(part => part[0]).join("")}</span><span className="customer-copy"><b>{customer.name}</b><small>{customer.id} · {customer.city}</small></span><span className="customer-score"><b>{customer.repayment}</b><small>repayment</small></span><ChevronRight size={15} /></button>)}<div className="list-foot"><Users size={14} /> {filtered.length} of 120 synthetic profiles</div></div><div className="panel customer-detail"><div className="customer-head"><div className={`avatar large ${selected.color}`}>{selected.name.split(" ").map(part => part[0]).join("")}</div><div><span className="panel-kicker">{selected.id} / {selected.segment}</span><h2>{selected.name}</h2><p>{selected.city} · active borrower since Feb 2024</p></div><div className="detail-head-actions"><button className="icon-button" onClick={() => toast("Profile pinned", { description: selected.name })}><Crosshair size={15} /></button><button className="button outline compact" onClick={() => onNavigate("Cases")}><BriefcaseBusiness size={14} /> Open case</button></div></div><div className="score-strip"><div><span>Fraud risk</span><b className="coral-text">{selected.fraud}</b><div className="score-progress"><span style={{ width: `${selected.fraud}%` }} /></div></div><div><span>Repayment risk</span><b className="mint-text">{selected.repayment}</b><div className="score-progress mint"><span style={{ width: `${selected.repayment}%` }} /></div></div><div><span>Cash runway</span><b>{selected.runway}</b><small>at current burn</small></div></div><div className="bridge-card"><div className="bridge-icon"><ArrowDownRight size={16} /></div><div><b>{selected.status}</b><p>Scam loss this month is feeding the repayment score. Offer support before collections.</p></div><button className="text-button" onClick={() => toast("Support path drafted", { description: "EMI holiday + recall funds recommended" })}>Draft support <ChevronRight size={14} /></button></div><div className="timeline"><div className="panel-top"><div><span className="panel-kicker">ACTIVITY TIMELINE</span><h3>What changed this month</h3></div><span className="case-tag">live</span></div>{[{ time: "Today · 01:40", title: "Payment sent to first-time payee", text: "₹42,000 · remote-access app active · fraud score +65", tone: "coral" }, { time: "Today · 01:44", title: "Bridge alert opened", text: "EMI due in 4 days · balance below scheduled payment", tone: "amber" }, { time: "Sep 28 · 09:15", title: "Income deposit received", text: "₹58,000 · 18% below six-month baseline", tone: "mint" }, { time: "Sep 12 · 18:06", title: "EMI paid on time", text: "Loan LN-88214 · 6-month streak before incident", tone: "violet" }].map(item => <div className="timeline-item" key={item.time}><span className={`timeline-dot ${item.tone}`} /><span className="timeline-line" /><div><small>{item.time}</small><b>{item.title}</b><p>{item.text}</p></div></div>)}</div></div></Reveal></div>;
}

function NetworkView() {
  const [selectedNode, setSelectedNode] = useState("Mule 01");
  const nodes = [{ id: "A", label: "Ananya", x: 92, y: 146, tone: "mint", type: "Victim", amount: "₹42,000 sent" }, { id: "B", label: "Rohan", x: 116, y: 292, tone: "amber", type: "Victim", amount: "₹18,500 sent" }, { id: "C", label: "Mule 01", x: 336, y: 218, tone: "coral", type: "Mule account", amount: "₹60,500 received" }, { id: "D", label: "Payee X", x: 560, y: 132, tone: "violet", type: "Cash-out", amount: "₹51,200 forwarded" }, { id: "E", label: "Payee Y", x: 572, y: 326, tone: "violet", type: "Cash-out", amount: "₹9,300 forwarded" }, { id: "F", label: "Device 08", x: 344, y: 404, tone: "amber", type: "Shared device", amount: "3 accounts linked" }];
  const selected = nodes.find(node => node.label === selectedNode) ?? nodes[2];
  return <div className="view-stack"><Reveal className="page-intro split"><div><div className="eyebrow"><span className="eyebrow-line" /> MULE NETWORK / BEHAVIOUR GRAPH</div><h1>Follow the money, not the label.</h1><p>Victims, mules, devices, and cash-out accounts connected by behaviour—not guesswork.</p></div><div className="intro-stat"><span>03</span><small>suspect clusters</small></div></Reveal><Reveal className="network-layout"><div className="panel network-panel"><div className="network-toolbar"><span className="panel-kicker">CLUSTER 01 / EMERGING</span><div><button className="icon-button" onClick={() => toast("Network zoom ready", { description: "Synthetic graph is fitted to the current cluster" })}><ZoomIcon /></button><button className="icon-button" onClick={() => { setSelectedNode("Mule 01"); toast("Graph reset", { description: "Cluster 01 restored" }); }}><RefreshCw size={14} /></button></div></div><NeuralNetworkGraph nodes={nodes} edges={[{source:"A",target:"C"},{source:"B",target:"C"},{source:"C",target:"D"},{source:"C",target:"E"},{source:"B",target:"F"},{source:"F",target:"E"}]} width="100%" height="470px" /><div className="network-legend"><span><i className="legend-dot mint" /> Victim</span><span><i className="legend-dot coral" /> Mule</span><span><i className="legend-dot violet" /> Cash-out</span><span><i className="legend-dot amber" /> Device / shared</span></div></div><div className="panel node-detail"><div className="panel-kicker">SELECTED NODE</div><div className="node-heading"><span className={`node-avatar ${selected.tone}`}>{selected.label[0]}</span><div><h2>{selected.label}</h2><p>{selected.type}</p></div></div><div className="node-stat"><span>Observed flow</span><b>{selected.amount}</b></div><div className="node-stat"><span>Relationship strength</span><b className="coral-text">87 / 100</b></div><div className="node-stat"><span>Last activity</span><b>01:44 today</b></div><div className="node-note"><Sparkles size={15} /><p><b>Why it matters</b> Fast pass-through from two unrelated senders suggests a mule pattern. Device 08 is shared across three accounts.</p></div><button className="button primary full" onClick={() => toast("Cluster added to watchlist", { description: `${selected.label} · synthetic graph action` })}><Eye size={14} /> Watch this node</button></div></Reveal><Reveal className="network-foot-grid"><div className="panel"><span className="panel-kicker">FLOW VELOCITY</span><h3>80% passed on within 4 hours</h3><div className="flow-line"><span style={{ width: "80%" }} /></div><p className="muted-copy">Fast pass-through is a stronger mule signal than device risk alone.</p></div><div className="panel"><span className="panel-kicker">EMERGING WATCH</span><h3>Micro-payment burst detected</h3><p className="muted-copy">No known signature match yet. Cluster held for analyst review before a new rule is drafted.</p><button className="panel-link">Open emerging cluster <ChevronRight size={14} /></button></div></Reveal></div>;
}

function ZoomIcon() { return <span className="zoom-icon"><span /><i /></span>; }

function LoansView({ onNavigate }: { onNavigate: (view: View) => void }) {
  const [actions, setActions] = useState<Record<string, string[]>>({});
  const logLoanAction = (loanId: string, label: string, customer: string) => {
    setActions(current => ({ ...current, [loanId]: [...(current[loanId] ?? []).filter(item => item !== label), label] }));
    toast.success(`${label} drafted`, { description: `${customer} · synthetic support action` });
  };
  return <div className="view-stack"><Reveal className="page-intro split"><div><div className="eyebrow"><span className="eyebrow-line" /> LOANS / REPAYMENT HEALTH</div><h1>Keep the loan healthy.</h1><p>Distress shows up as a pattern: balance, income, spend, debt, and what is due next.</p></div><button className="button primary" onClick={() => onNavigate("Cases")}><HeartHandshake size={15} /> Open support queue</button></Reveal><Reveal className="loan-grid">{loans.map((loan, index) => <div className="panel loan-card" key={loan.id} style={{ "--delay": `${index * 0.08}s` } as React.CSSProperties}><div className="loan-card-head"><div><span className="panel-kicker">{loan.id}</span><h3>{loan.customer}</h3><p>{loan.product}</p></div><span className={`trend-icon ${loan.trend}`}><ArrowDownRight size={15} /></span></div><div className="loan-main"><div><span>Repayment score</span><b className={loan.risk > 45 ? "coral-text" : "mint-text"}>{loan.risk}</b></div><div><span>Cash runway</span><b>{loan.runway}</b></div></div><div className="loan-detail-grid"><div><span>Principal</span><b>{loan.principal}</b></div><div><span>EMI</span><b>{loan.emi}</b></div><div><span>Due in</span><b className="amber-text">{loan.due}</b></div><div><span>DPD</span><b>{loan.dpd}</b></div></div><div className="payment-history"><span className="panel-kicker">LAST 6 PAYMENTS</span><div>{[1, 1, 1, 1, 0, 1].map((paid, i) => <i className={paid ? "paid" : "late"} key={i}>{paid ? <Check size={11} /> : "·"}</i>)}</div></div><div className="loan-actions"><button className="button outline compact" onClick={() => logLoanAction(loan.id, "EMI holiday", loan.customer)}><Clock3 size={13} /> EMI holiday</button><button className="button outline compact" onClick={() => logLoanAction(loan.id, "Restructure", loan.customer)}><HeartHandshake size={13} /> Restructure</button><button className="button ghost compact" onClick={() => onNavigate("Customers")}>View customer <ChevronRight size={13} /></button></div>{actions[loan.id]?.length ? <div className="loan-action-state"><Check size={12} /> {actions[loan.id].join(" · ")} logged</div> : null}</div>)}</Reveal></div>;
}

function EvaluationView() {
  const [fraudThreshold, setFraudThreshold] = useState(55);
  const [repaymentThreshold, setRepaymentThreshold] = useState(40);
  const metrics = useMemo(() => ({ fraudPrecision: Math.min(99, 81 + Math.round((fraudThreshold - 40) * 0.63)), fraudRecall: Math.max(64, 93 - Math.round((fraudThreshold - 40) * 0.83)), fraudAlerts: Math.max(18, 32 - Math.round((fraudThreshold - 40) * 0.35)), repaymentPrecision: Math.min(96, 76 + Math.round((repaymentThreshold - 35) * 0.58)), repaymentRecall: Math.max(59, 89 - Math.round((repaymentThreshold - 35) * 0.74)) }), [fraudThreshold, repaymentThreshold]);
  const f1 = (precision: number, recall: number) => Math.round((2 * precision * recall) / (precision + recall));
  return <div className="view-stack"><Reveal className="page-intro"><div><div className="eyebrow"><span className="eyebrow-line" /> EVALUATION LAB / LABELS INJECTED</div><h1>Make the trade-off visible.</h1><p>Move the thresholds. Watch precision, recall, F1, and alert volume respond against synthetic ground truth.</p></div></Reveal><Reveal className="evaluation-layout"><div className="panel lab-panel"><div className="panel-top"><div><span className="panel-kicker">THRESHOLD CONTROLS</span><h2>Signal sensitivity</h2></div><span className="case-tag">LIVE CALC</span></div><div className="slider-block"><div className="slider-heading"><div><span className="slider-label coral-text">Fraud alert threshold</span><p>Hold + call above this score</p></div><b className="coral-text">{fraudThreshold}</b></div><input type="range" min="20" max="90" value={fraudThreshold} onChange={event => setFraudThreshold(Number(event.target.value))} className="range coral-range" /><div className="range-labels"><span>20 / sensitive</span><span>90 / strict</span></div></div><div className="slider-block"><div className="slider-heading"><div><span className="slider-label mint-text">Repayment watch threshold</span><p>Offer support above this score</p></div><b className="mint-text">{repaymentThreshold}</b></div><input type="range" min="20" max="90" value={repaymentThreshold} onChange={event => setRepaymentThreshold(Number(event.target.value))} className="range mint-range" /><div className="range-labels"><span>20 / broad</span><span>90 / narrow</span></div></div><div className="rule-callout"><Zap size={15} /><p><b>Current rule of thumb</b><br />Nudge first, hold only at high scores, and never penalise a confirmed victim.</p></div></div><div className="panel metrics-panel"><div className="panel-top"><div><span className="panel-kicker">SYNTHETIC LABEL CHECK</span><h2>Detection quality</h2></div><span className="case-tag">{metrics.fraudAlerts} alerts</span></div><div className="metric-table"><div className="metric-table-head"><span>Model</span><span>Precision</span><span>Recall</span><span>F1</span></div><div className="metric-table-row"><span><i className="legend-dot coral" /> Fraud</span><b>{metrics.fraudPrecision}%</b><b>{metrics.fraudRecall}%</b><b>{f1(metrics.fraudPrecision, metrics.fraudRecall)}%</b></div><div className="metric-table-row"><span><i className="legend-dot mint" /> Repayment</span><b>{metrics.repaymentPrecision}%</b><b>{metrics.repaymentRecall}%</b><b>{f1(metrics.repaymentPrecision, metrics.repaymentRecall)}%</b></div></div><div className="matrix"><div className="matrix-title">Fraud at threshold {fraudThreshold}</div><div className="matrix-grid"><span className="axis-label top-label">Actual</span><span className="axis-label side-label">Predicted</span><div className="matrix-cell safe"><b>88</b><small>true negative</small></div><div className="matrix-cell false"><b>{Math.max(4, 24 - Math.round(fraudThreshold / 10))}</b><small>false positive</small></div><div className="matrix-cell false"><b>{Math.max(5, Math.round((100 - metrics.fraudRecall) / 2))}</b><small>false negative</small></div><div className="matrix-cell danger"><b>{metrics.fraudAlerts}</b><small>true positive</small></div></div></div><div className="lab-note"><Database size={14} /><span>Ground truth: 4 scam signatures + mule + emerging labels across 3,800 transactions.</span></div></div></Reveal><Reveal className="evaluation-foot"><div className="panel"><div className="panel-kicker">TIERED RESPONSE</div><div className="tier-rule"><TierBadge tier="Critical" /><span>Fraud ≥ 55</span><b>Hold + call</b></div><div className="tier-rule"><TierBadge tier="Watch" /><span>40 to 54</span><b>Verification nudge</b></div><div className="tier-rule"><TierBadge tier="Nudge" /><span>Under 40</span><b>Watchlist</b></div></div><div className="panel evaluation-quote"><Sparkles size={17} /><p>“That gap is why alerts are tiered. The best model is the one an analyst can trust at a glance.”</p></div></Reveal></div>;
}

function CasesView() {
  const [cases, setCases] = useState(caseSeed);
  const [status, setStatus] = useState<CaseStatus | "All">("All");
  const visible = status === "All" ? cases : cases.filter(item => item.status === status);
  const moveCase = (id: string) => setCases(current => current.map(item => item.id === id ? { ...item, status: item.status === "Open" ? "Contacted" : item.status === "Contacted" ? "Resolved" : "Resolved" } : item));
  const createCase = () => setCases(current => [{ id: "CASE-1043", customer: "Sahil Nair", issue: "Payment request / support", owner: "A. Rao", status: "Open", age: "now" }, ...current]);
  return <div className="view-stack"><Reveal className="page-intro split"><div><div className="eyebrow"><span className="eyebrow-line" /> CASES / HUMAN-IN-THE-LOOP</div><h1>Turn signals into support.</h1><p>Every action is logged. Every victim gets a path back to healthy repayment.</p></div><button className="button primary" onClick={() => { createCase(); toast.success("New case created", { description: "CASE-1043 added to Open" }); }}><BriefcaseBusiness size={14} /> Create case</button></Reveal><Reveal className="case-status-row">{(["Open", "Contacted", "Resolved"] as CaseStatus[]).map(item => <button key={item} className={`case-status-card ${status === item ? "active" : ""}`} onClick={() => setStatus(item)}><span>{item}</span><b>{cases.filter(caseItem => caseItem.status === item).length + (item === "Open" ? 10 : item === "Resolved" ? 18 : 6)}</b><small>{item === "Open" ? "needs first action" : item === "Contacted" ? "in conversation" : "healthy outcome"}</small></button>)}</Reveal><Reveal className="panel case-table"><div className="table-head"><span>Case / customer</span><span>Issue</span><span>Owner</span><span>Status</span><span>Next</span></div>{visible.map(item => <div className="case-row" key={item.id}><div className="case-id"><span className="case-icon"><BriefcaseBusiness size={14} /></span><span><b>{item.id}</b><small>{item.customer} · {item.age} ago</small></span></div><span className="case-issue">{item.issue}</span><span className="case-owner">{item.owner}</span><TierBadge tier={item.status === "Resolved" ? "Nudge" : item.status === "Contacted" ? "Watch" : "Critical"} /><button className="button ghost compact" disabled={item.status === "Resolved"} onClick={() => { moveCase(item.id); toast.success(item.status === "Open" ? "Customer contacted" : "Case resolved", { description: item.customer }); }}>{item.status === "Open" ? "Contact" : item.status === "Contacted" ? "Resolve" : "Resolved"} <ChevronRight size={13} /></button></div>)}</Reveal><Reveal className="case-note panel"><ShieldCheck size={18} /><div><b>Human sign-off protects the feedback loop.</b><p>Analysts label outcomes, not the model. Confirmed victims route to support; no penalty is applied while the bridge is open.</p></div></Reveal></div>;
}

function FairnessView() {
  const segments = [{ name: "Emerging", rate: 26, delta: "+12pp", tone: "coral", note: "Review" }, { name: "Salaried", rate: 14, delta: "baseline", tone: "mint", note: "Within range" }, { name: "Gig worker", rate: 12, delta: "-2pp", tone: "violet", note: "Within range" }, { name: "Retired", rate: 10, delta: "-4pp", tone: "amber", note: "Within range" }];
  return <div className="view-stack"><Reveal className="page-intro split"><div><div className="eyebrow"><span className="eyebrow-line" /> FAIRNESS / SEGMENT CHECK</div><h1>Make bias visible, early.</h1><p>Alert rate by income segment. A first run flags Emerging customers for analyst review.</p></div><div className="intro-stat"><span>1</span><small>segment flagged</small></div></Reveal><Reveal className="fairness-layout"><div className="panel fairness-panel"><div className="panel-top"><div><span className="panel-kicker">ALERT RATE BY SEGMENT</span><h2>Who gets flagged?</h2></div><span className="case-tag">threshold 55</span></div><div className="fairness-bars">{segments.map(segment => <div className="fairness-row" key={segment.name}><div className="fairness-label"><span className={`legend-dot ${segment.tone}`} /><b>{segment.name}</b><small>{segment.note}</small></div><div className="fairness-track"><span className={segment.tone} style={{ width: `${(segment.rate / 30) * 100}%` }} /><i /></div><b className="fairness-value">{segment.rate}%</b><span className={`delta ${segment.tone}`}>{segment.delta}</span></div>)}</div><div className="fairness-baseline"><span><i /> portfolio mean 14%</span><span><i /> review band ±5pp</span></div></div><div className="panel fairness-detail"><div className="panel-kicker">ANALYST NOTE</div><div className="fairness-alert"><CircleAlert size={16} /><div><b>Emerging segment is above the review band.</b><p>26% fraud alerts vs 10–14% elsewhere. Do not auto-tighten the threshold; check legitimate look-alikes and shared-device signals first.</p></div></div><div className="fairness-mini-grid"><div><b>26%</b><span>flagged</span></div><div><b>14%</b><span>portfolio mean</span></div><div><b>+12pp</b><span>disparity</span></div></div><button className="button primary full" onClick={() => toast("Fairness review opened", { description: "Emerging segment added to analyst queue" })}><Fingerprint size={14} /> Open review queue</button></div></Reveal><Reveal className="panel fairness-foot"><div className="panel-kicker">PRIVACY + TRUST</div><div className="trust-points"><span><Check size={14} /> Personal baselines, not labels</span><span><Check size={14} /> Device signals never decide alone</span><span><Check size={14} /> Plain-language reasons double as customer messages</span></div></Reveal></div>;
}

export default function Home() {
  const [activeView, setActiveView] = useState<View>("Overview");
  const [selectedAlert, setSelectedAlert] = useState<Alert>(alerts[0]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => { const onScroll = () => { const max = document.documentElement.scrollHeight - window.innerHeight; setScrollProgress(max > 0 ? (window.scrollY / max) * 100 : 0); }; window.addEventListener("scroll", onScroll, { passive: true }); onScroll(); return () => window.removeEventListener("scroll", onScroll); }, []);
  const navigate = (view: View) => { setActiveView(view); setMobileNavOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return <div className="app-shell"><CinematicSpace progress={scrollProgress} /><div className="scroll-progress"><span style={{ width: `${scrollProgress}%` }} /></div><aside className={`sidebar ${mobileNavOpen ? "mobile-open" : ""}`}><div className="brand-lockup"><div className="brand-mark"><Shield size={17} /></div><div><b>KAVACH</b><span>risk command center</span></div></div><div className="rail-label">OPERATE</div><nav>{navItems.map(item => { const Icon = item.icon; return <button key={item.label} className={activeView === item.label ? "active" : ""} onClick={() => navigate(item.label)}><Icon size={16} /><span>{item.label}</span>{item.meta && <em>{item.meta}</em>}</button>; })}</nav><div className="sidebar-bottom"><div className="mode-card"><span className="live-dot" /><div><b>Live synthetic mode</b><small>120 customers · 3.8k txns</small></div><button onClick={() => toast("Synthetic mode is locked on", { description: "Prototype data stays local to this workspace" })}><LockKeyhole size={13} /></button></div><div className="operator"><div className="operator-avatar">AR</div><div><b>Aditi Rao</b><small>Risk operations</small></div><button onClick={() => toast("Operator menu", { description: "Profile controls are synthetic" })}><Menu size={15} /></button></div></div></aside>{mobileNavOpen && <button className="mobile-overlay" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} /> }<main className="main-area"><header className="topbar"><button className="mobile-menu" onClick={() => setMobileNavOpen(true)}><PanelLeft size={17} /></button><div className="breadcrumb"><span>KAVACH</span><ChevronRight size={13} /><b>{activeView}</b></div><div className="topbar-actions"><div className="stream-status"><span className="live-dot" /> Synthetic stream <b>●</b> 12:54:26</div><button className="icon-button" onClick={() => toast("No new notifications", { description: "All high-risk alerts are already in the queue" })}><Bell size={16} /><i className="notification-dot" /></button><button className="operator-mini" onClick={() => toast("Operator workspace", { description: "Aditi Rao · Risk operations" })}>AR</button></div></header><div className="content-wrap">{activeView === "Overview" && <Overview onNavigate={navigate} onSelectAlert={setSelectedAlert} selectedAlert={selectedAlert} scrollProgress={scrollProgress} />}{activeView === "Alerts" && <AlertsView selectedAlert={selectedAlert} setSelectedAlert={setSelectedAlert} onNavigate={navigate} />}{activeView === "Customers" && <CustomersView onNavigate={navigate} />}{activeView === "Mule network" && <NetworkView />}{activeView === "Loans" && <LoansView onNavigate={navigate} />}{activeView === "Evaluation" && <EvaluationView />}{activeView === "Cases" && <CasesView />}{activeView === "Fairness" && <FairnessView />}<footer><div><span className="footer-mark"><Shield size={12} /></span><b>KAVACH</b> / protect the customer first</div><span>synthetic data · no customer PII · model v2.4</span></footer></div></main></div>;
}

