// Rozložení živého 3D městečka (/mestecko/nove). Nejdřív síť ulic, budovy až podle ní: každá budova
// stojí dveřmi k ulici a k dveřím vede příjezdová cesta (doplní se automaticky v `buildRoads`).
// Souřadnice jsou v metrech: x doprava (východ), z dolů na mapě (jih), y nahoru. Modely jsou
// v public/mestecko3d/<model>.glb s dveřmi k +z; `ry` je natočení kolem osy y.

export type Pt = [number, number];
export type Road = { a: Pt; b: Pt; w: number; planned?: boolean; drive?: boolean; id?: string };
export type PlaceKind = "place" | "world" | "home" | "plot";

export type Place = {
  id: string;
  kind: PlaceKind;
  icon: string;
  model: string;
  x: number;
  z: number;
  ry: number;
  // půlšířka a půlhloubka půdorysu (kolize s cestami a dekoracemi) a vzdálenost dveří od středu
  hw: number;
  hd: number;
  door: number;
  scale?: number;
  href?: string;
  label: number; // výška popisku nad zemí
};

export const ROAD_W = 3.4;

export const MAIN_ROADS: Road[] = [
  { a: [-38, 0], b: [38, 0], w: ROAD_W },
  { a: [0, 0], b: [0, -18], w: ROAD_W },
  { a: [-38, -18], b: [38, -18], w: ROAD_W },
  { a: [0, -18], b: [0, -25], w: ROAD_W },
  { a: [-38, 0], b: [-38, -18], w: ROAD_W },
  { a: [38, 0], b: [38, -18], w: ROAD_W },
  { a: [-38, -18], b: [-46, -28], w: ROAD_W },
  { a: [38, -18], b: [46, -28], w: ROAD_W },
  { a: [-46, -28], b: [-48, -36], w: ROAD_W },
  { a: [46, -28], b: [49, -36], w: ROAD_W },
  { a: [0, 0], b: [0, 28], w: ROAD_W },
  { a: [-30, 0], b: [-30, 28], w: ROAD_W },
  { a: [30, 0], b: [30, 28], w: ROAD_W },
  { a: [-46, 28], b: [46, 28], w: ROAD_W },
  { a: [-46, 28], b: [-52, 36], w: ROAD_W },
  { a: [0, 28], b: [0, 31.5], w: ROAD_W },
  { a: [46, 28], b: [50, 33], w: ROAD_W },
  // plánované cesty k parcelám (dostaví se za body)
  { a: [-38, 0], b: [-58, 0], w: ROAD_W, planned: true, id: "zapad" },
  { a: [38, 0], b: [58, 0], w: ROAD_W, planned: true, id: "vychod" },
  { a: [-46, 28], b: [-60, 20], w: ROAD_W, planned: true, id: "severozapad" },
];

export const RIVER_Z = 14;
// kašna uprostřed náměstí: ulice ji obcházejí po kruhu
export const FOUNTAIN = { x: 0, z: 0, r: 4.1, ring: 5.3 };
export const BRIDGES_X = [-30, 0, 30];
export const LAGOON = { x: 0, z: 45, r: 12 };
export const SEA = { x: -64, z: 48, w: 36, d: 30 };

export const PLACES: Place[] = [
  { id: "namesti", kind: "place", icon: "⛲", model: "fontana", x: 0, z: 0, ry: 0, hw: 9, hd: 9, door: 0, label: 6 },
  { id: "skola", kind: "place", icon: "🏫", model: "skola", x: 0, z: -32, ry: 0, hw: 7.6, hd: 4.2, door: 6.2, href: "/kurzy", label: 17 },
  { id: "knihovna", kind: "place", icon: "📚", model: "knihovna", x: -18, z: -9.5, ry: 0, hw: 4.8, hd: 3.4, door: 4.6, href: "/materialy", label: 9.5 },
  { id: "hvezdarna", kind: "place", icon: "🔭", model: "hvezdarna", x: -30, z: -9.5, ry: 0, hw: 3.3, hd: 3.3, door: 3.6, label: 10 },
  { id: "herna", kind: "place", icon: "🕹️", model: "herna", x: 18, z: -9.5, ry: 0, hw: 4.9, hd: 3.3, door: 3.5, href: "/stale-hry", label: 10 },
  { id: "arena", kind: "place", icon: "🏆", model: "arena", x: 30, z: -10, ry: 0, hw: 4.8, hd: 4.8, door: 5.2, href: "/zebricky", label: 8 },
  { id: "kvetinarstvi", kind: "place", icon: "🌷", model: "kvetinarstvi", x: -22, z: 6.6, ry: Math.PI, hw: 3.2, hd: 2.6, door: 3.4, label: 8 },
  { id: "obchod", kind: "place", icon: "🛍️", model: "obchod", x: -12, z: 6.6, ry: Math.PI, hw: 3.2, hd: 2.6, door: 3.4, href: "/obchod", label: 8 },
  { id: "pekarna", kind: "place", icon: "🥐", model: "pekarna", x: 12, z: 6.6, ry: Math.PI, hw: 3.2, hd: 2.6, door: 3.4, label: 8 },
  { id: "pokoj", kind: "place", icon: "🛏️", model: "pokoj", x: 22, z: 6.6, ry: Math.PI, hw: 3.2, hd: 2.6, door: 3.4, href: "/pokoj", label: 8 },
  { id: "les", kind: "world", icon: "🧚", model: "strom", x: -50, z: -42, ry: 0.2, hw: 3, hd: 3, door: 3.2, href: "/uzivatelsky-obchod?svet=forest", label: 21 },
  { id: "hrad", kind: "world", icon: "🏰", model: "hrad", x: 51, z: -44, ry: -0.2, hw: 8.2, hd: 5.4, door: 7, href: "/uzivatelsky-obchod?svet=castle", label: 22 },
  { id: "pristav", kind: "world", icon: "⚓", model: "molo", x: -55, z: 41, ry: 0, hw: 2.5, hd: 6, door: 0, href: "/uzivatelsky-obchod?svet=pirate", label: 14 },
  { id: "more", kind: "world", icon: "🐠", model: "podmorske", x: 0, z: 45, ry: 0, hw: 10, hd: 10, door: 0, href: "/uzivatelsky-obchod?svet=sea", label: 10 },
  { id: "stanice", kind: "world", icon: "🚀", model: "stanice", x: 55, z: 42, ry: 0, hw: 8, hd: 8, door: 0, href: "/uzivatelsky-obchod?svet=space", label: 20 },
  // domky obyvatel (každý má svého obyvatele s úkolem)
  { id: "babicka", kind: "home", icon: "👵", model: "domek1", x: -14, z: -24.5, ry: Math.PI, hw: 2.6, hd: 2.4, door: 2.8, label: 7 },
  { id: "farmar", kind: "home", icon: "👨‍🌾", model: "domek2", x: 14, z: -24.5, ry: Math.PI, hw: 2.6, hd: 2.4, door: 2.8, label: 7 },
  { id: "kluk", kind: "home", icon: "🧒", model: "domek3", x: -18, z: 34.5, ry: 0, hw: 2.6, hd: 2.4, door: 2.8, label: 7 },
  { id: "rybar", kind: "home", icon: "🎣", model: "domek4", x: -38, z: 34.5, ry: 0, hw: 2.6, hd: 2.4, door: 2.8, label: 7 },
  { id: "vedkyne", kind: "home", icon: "👩‍🔬", model: "domek5", x: 18, z: 34.5, ry: 0, hw: 2.6, hd: 2.4, door: 2.8, label: 7 },
  { id: "kapitan", kind: "home", icon: "🧑‍✈️", model: "domek6", x: 38, z: 34.5, ry: 0, hw: 2.6, hd: 2.4, door: 2.8, label: 7 },
  // volné parcely pro vlastní stavby
  { id: "parcela1", kind: "plot", icon: "🏗️", model: "parcela", x: -52, z: 7, ry: Math.PI, hw: 4, hd: 3.5, door: 0, label: 4 },
  { id: "parcela2", kind: "plot", icon: "🏗️", model: "parcela", x: 52, z: 7, ry: Math.PI, hw: 4, hd: 3.5, door: 0, label: 4 },
  { id: "parcela3", kind: "plot", icon: "🏗️", model: "parcela", x: -52, z: -7, ry: 0, hw: 4, hd: 3.5, door: 0, label: 4 },
  { id: "parcela4", kind: "plot", icon: "🏗️", model: "parcela", x: 52, z: -7, ry: 0, hw: 4, hd: 3.5, door: 0, label: 4 },
  { id: "parcela5", kind: "plot", icon: "🏗️", model: "parcela", x: -65.4, z: 16.9, ry: 1.05, hw: 4, hd: 3.5, door: 0, label: 4 },
];

// Stánky tržiště u cesty k hradu (mimo cestu, ověřuje `layoutProblems`).
export const STALLS: { x: number; z: number; ry: number }[] = [
  { x: 40.5, z: -29, ry: -0.6 },
  { x: 41.5, z: -35.5, ry: -0.4 },
  { x: 52, z: -25, ry: -2.4 },
];

export const LAMPS: Pt[] = [
  [-4, 2.6], [4, -2.6], [-24, -2.4], [24, 2.4], [-2.4, -12], [2.4, -12], [-2.4, 22], [2.4, 22],
  [-27.4, 22], [32.4, 22], [-20, -15.6], [20, -20.4], [-40.4, -8], [40.4, -8], [-8, 30.4], [8, 30.4],
];

export function doorPoint(p: Place): Pt {
  return [p.x + Math.sin(p.ry) * p.door, p.z + Math.cos(p.ry) * p.door];
}

function nearestOnRoad(x: number, z: number, r: Road): { pt: Pt; d: number; k: number } {
  const [x1, z1] = r.a;
  const [x2, z2] = r.b;
  const dx = x2 - x1;
  const dz = z2 - z1;
  const k = Math.max(0, Math.min(1, ((x - x1) * dx + (z - z1) * dz) / (dx * dx + dz * dz)));
  const pt: Pt = [x1 + dx * k, z1 + dz * k];
  return { pt, d: Math.hypot(x - pt[0], z - pt[1]), k };
}

export function distToRoad(x: number, z: number, r: Road): number {
  return nearestOnRoad(x, z, r).d;
}

// Všechny cesty včetně příjezdů od dveří budov k nejbližší ulici; `built` = dostavěné plánované cesty (podle id).
export function buildRoads(built: readonly string[] = []): Road[] {
  const roads = MAIN_ROADS.map((r) => (r.planned && r.id && built.includes(r.id) ? { ...r, planned: false } : r));
  for (const p of PLACES) {
    if (!p.door) continue;
    const [fx, fz] = doorPoint(p);
    let best: { pt: Pt; d: number } | null = null;
    for (const r of MAIN_ROADS) {
      if (r.planned) continue;
      const n = nearestOnRoad(fx, fz, r);
      if (!best || n.d < best.d) best = n;
    }
    if (best && best.d > ROAD_W / 2 + 0.3) roads.push({ a: [fx, fz], b: best.pt, w: 2, drive: true });
  }
  return roads;
}

// Kontrola rozložení: nic nesmí stát na cestě (kromě vlastního příjezdu budovy).
export function layoutProblems(roads = buildRoads()): string[] {
  const out: string[] = [];
  for (const p of PLACES) {
    if (p.kind === "world" && (p.id === "pristav" || p.id === "more" || p.id === "stanice")) continue;
    if (p.id === "namesti") continue;
    const [fx, fz] = doorPoint(p);
    for (let i = -2; i <= 2; i++)
      for (let j = -2; j <= 2; j++) {
        const lx = (p.hw * i) / 2;
        const lz = (p.hd * j) / 2;
        const x = p.x + lx * Math.cos(p.ry) + lz * Math.sin(p.ry);
        const z = p.z - lx * Math.sin(p.ry) + lz * Math.cos(p.ry);
        const hit = roads.find((r) => !(r.drive && Math.hypot(r.a[0] - fx, r.a[1] - fz) < 0.01) && distToRoad(x, z, r) < r.w / 2 + 0.15);
        if (hit) {
          out.push(p.id);
          i = j = 3;
        }
      }
  }
  for (const s of STALLS) if (roads.some((r) => distToRoad(s.x, s.z, r) < r.w / 2 + 1.5)) out.push(`stánek ${s.x},${s.z}`);
  for (const [x, z] of LAMPS) if (roads.some((r) => distToRoad(x, z, r) < r.w / 2 + 0.3)) out.push(`lampa ${x},${z}`);
  return out;
}

// ------------------------------------------------------------------------------- hledání cesty po ulicích
// Graf: koncové body a průsečíky cest jsou uzly; hrdina chodí jen po ulicích a příjezdech.
export type Graph = { nodes: Pt[]; edges: Map<number, { to: number; d: number }[]> };

export function buildGraph(roads: Road[]): Graph {
  const usable = roads.filter((r) => !r.planned);
  const nodes: Pt[] = [];
  const idOf = (p: Pt) => {
    const i = nodes.findIndex((n) => Math.hypot(n[0] - p[0], n[1] - p[1]) < 0.5);
    if (i >= 0) return i;
    nodes.push(p);
    return nodes.length - 1;
  };
  // body na každé cestě: konce + místa, kde na ni ústí jiná cesta
  const cuts = usable.map((r) => [{ k: 0, p: r.a }, { k: 1, p: r.b }]);
  usable.forEach((r, i) => {
    for (const other of usable) {
      if (other === r) continue;
      for (const end of [other.a, other.b]) {
        const n = nearestOnRoad(end[0], end[1], r);
        if (n.d < 0.6 && n.k > 0.001 && n.k < 0.999) cuts[i].push({ k: n.k, p: n.pt });
      }
    }
    // průsečíky dvou ulic (kříž)
    for (const other of usable) {
      if (other === r) continue;
      const hit = intersect(r, other);
      if (hit) cuts[i].push(hit);
    }
  });
  const edges = new Map<number, { to: number; d: number }[]>();
  const link = (a: number, b: number) => {
    if (a === b) return;
    const d = Math.hypot(nodes[a][0] - nodes[b][0], nodes[a][1] - nodes[b][1]);
    (edges.get(a) ?? edges.set(a, []).get(a)!).push({ to: b, d });
    (edges.get(b) ?? edges.set(b, []).get(b)!).push({ to: a, d });
  };
  cuts.forEach((list) => {
    list.sort((x, y) => x.k - y.k);
    for (let i = 0; i + 1 < list.length; i++) link(idOf(list[i].p), idOf(list[i + 1].p));
  });
  // uzel v kašně nahradí kruh kolem ní
  const center = nodes.findIndex((n) => Math.hypot(n[0] - FOUNTAIN.x, n[1] - FOUNTAIN.z) < FOUNTAIN.r);
  if (center >= 0) {
    const ring: number[] = [];
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      nodes.push([FOUNTAIN.x + Math.cos(a) * FOUNTAIN.ring, FOUNTAIN.z + Math.sin(a) * FOUNTAIN.ring]);
      ring.push(nodes.length - 1);
    }
    const out = edges.get(center) ?? [];
    edges.delete(center);
    for (const [, list] of edges) list.splice(0, list.length, ...list.filter((e) => e.to !== center));
    ring.forEach((r, k) => link(r, ring[(k + 1) % ring.length]));
    for (const e of out) {
      const a = Math.atan2(nodes[e.to][1] - FOUNTAIN.z, nodes[e.to][0] - FOUNTAIN.x);
      const k = ((Math.round((a / (Math.PI * 2)) * 12) % 12) + 12) % 12;
      link(e.to, ring[k]);
    }
  }
  return { nodes, edges };
}

function intersect(r: Road, s: Road): { k: number; p: Pt } | null {
  const [x1, z1] = r.a;
  const [x2, z2] = r.b;
  const [x3, z3] = s.a;
  const [x4, z4] = s.b;
  const den = (x1 - x2) * (z3 - z4) - (z1 - z2) * (x3 - x4);
  if (Math.abs(den) < 1e-9) return null;
  const t = ((x1 - x3) * (z3 - z4) - (z1 - z3) * (x3 - x4)) / den;
  const u = -((x1 - x2) * (z1 - z3) - (z1 - z2) * (x1 - x3)) / den;
  if (t <= 0.001 || t >= 0.999 || u < 0 || u > 1) return null;
  return { k: t, p: [x1 + t * (x2 - x1), z1 + t * (z2 - z1)] };
}

export function nearestNode(g: Graph, x: number, z: number): number {
  let best = 0;
  let bd = Infinity;
  g.nodes.forEach((n, i) => {
    if (!g.edges.get(i)?.length) return;
    const d = Math.hypot(n[0] - x, n[1] - z);
    if (d < bd) {
      bd = d;
      best = i;
    }
  });
  return best;
}

// Dijkstra po grafu ulic; vrací body cesty od `from` k `to`.
export function findPath(g: Graph, from: number, to: number): Pt[] {
  const dist = new Map<number, number>([[from, 0]]);
  const prev = new Map<number, number>();
  const open = new Set<number>([from]);
  while (open.size) {
    let cur = -1;
    let cd = Infinity;
    for (const n of open) {
      const d = dist.get(n) ?? Infinity;
      if (d < cd) {
        cd = d;
        cur = n;
      }
    }
    open.delete(cur);
    if (cur === to) break;
    for (const e of g.edges.get(cur) ?? []) {
      const nd = cd + e.d;
      if (nd < (dist.get(e.to) ?? Infinity)) {
        dist.set(e.to, nd);
        prev.set(e.to, cur);
        open.add(e.to);
      }
    }
  }
  const path: Pt[] = [];
  let n: number | undefined = to;
  while (n !== undefined) {
    path.unshift(g.nodes[n]);
    if (n === from) break;
    n = prev.get(n);
  }
  return path[0] === g.nodes[from] ? path : [g.nodes[from], g.nodes[to]];
}
