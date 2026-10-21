// Doprava ve městě: auta jezdí po napojených silnicích a vlaky po kolejích.
// Je to jen vizuální vrstva (nemá vliv na výdělek), takže stačí náhodná chůze po grafu.

import { CITY_SIZE, connectedRoads, type Placed } from "@/lib/idle/city";

export type Vehicle = {
  kind: "car" | "train";
  color: string;
  // Posloupnost dlaždic (index = y * CITY_SIZE + x), po které vozidlo jede.
  path: number[];
  // Ušlá vzdálenost v dlaždicích od začátku `path`.
  dist: number;
  speed: number;
  length: number; // počet vagonů u vlaku
};

export type Graph = { cells: Set<number>; neighbours: Map<number, number[]> };

export type Traffic = {
  signature: string;
  roads: Graph;
  rails: Graph;
  vehicles: Vehicle[];
};

const CAR_COLORS = ["#e5484d", "#3b82f6", "#f5a524", "#2fb344", "#f4f4f6", "#8b5cf6", "#14b8a6"];
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function buildGraph(cells: Set<number>): Graph {
  const neighbours = new Map<number, number[]>();
  for (const c of cells) {
    const x = c % CITY_SIZE;
    const y = Math.floor(c / CITY_SIZE);
    const list: number[] = [];
    for (const [dx, dy] of DIRS) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= CITY_SIZE || ny >= CITY_SIZE) continue;
      const nc = ny * CITY_SIZE + nx;
      if (cells.has(nc)) list.push(nc);
    }
    neighbours.set(c, list);
  }
  return { cells, neighbours };
}

export function createTraffic(): Traffic {
  return {
    signature: "",
    roads: { cells: new Set(), neighbours: new Map() },
    rails: { cells: new Set(), neighbours: new Map() },
    vehicles: [],
  };
}

function signatureOf(items: Placed[]): string {
  let hash = 0;
  for (const [id, x, y] of items) {
    if (id !== "road" && id !== "rail" && id !== "crossing") continue;
    hash = (hash * 31 + id.charCodeAt(0) * 7 + x * 29 + y * 131) | 0;
  }
  return `${items.length}:${hash}`;
}

function pick(list: number[], avoid: number | undefined): number | undefined {
  if (list.length === 0) return undefined;
  const options = list.length > 1 && avoid !== undefined ? list.filter((c) => c !== avoid) : list;
  return options[Math.floor(Math.random() * options.length)];
}

function extend(path: number[], graph: Graph, minAhead: number, from: number) {
  while (path.length - 1 - from < minAhead) {
    const last = path[path.length - 1];
    const prev = path.length > 1 ? path[path.length - 2] : undefined;
    const next = pick(graph.neighbours.get(last) ?? [], prev);
    if (next === undefined) return false;
    path.push(next);
  }
  return true;
}

function spawn(kind: "car" | "train", graph: Graph): Vehicle | null {
  const cells = [...graph.cells];
  if (cells.length === 0) return null;
  const start = cells[Math.floor(Math.random() * cells.length)];
  const path = [start];
  if (!extend(path, graph, 4, 0)) return null;
  return {
    kind,
    color: kind === "train" ? "#d94f5c" : CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
    path,
    dist: 0,
    speed: kind === "train" ? 1.6 : 1.1 + Math.random() * 0.7,
    length: kind === "train" ? 3 : 1,
  };
}

// Dopočítá graf při změně města a udržuje potřebný počet vozidel.
export function updateTraffic(traffic: Traffic, items: Placed[], dt: number): void {
  const signature = signatureOf(items);
  if (signature !== traffic.signature) {
    traffic.signature = signature;
    const road = connectedRoads(items);
    const rail = new Set<number>();
    for (const [id, x, y] of items) if (id === "rail" || id === "crossing") rail.add(y * CITY_SIZE + x);
    traffic.roads = buildGraph(road);
    traffic.rails = buildGraph(rail);
    traffic.vehicles = traffic.vehicles.filter((v) => {
      const graph = v.kind === "car" ? traffic.roads : traffic.rails;
      return v.path.every((c) => graph.cells.has(c));
    });
  }

  const wantCars = Math.min(18, Math.floor(traffic.roads.cells.size / 4));
  const wantTrains = traffic.rails.cells.size >= 40 ? 2 : traffic.rails.cells.size >= 8 ? 1 : 0;
  const cars = traffic.vehicles.filter((v) => v.kind === "car").length;
  const trains = traffic.vehicles.length - cars;
  if (cars < wantCars) {
    const v = spawn("car", traffic.roads);
    if (v) traffic.vehicles.push(v);
  } else if (cars > wantCars) {
    const i = traffic.vehicles.findIndex((v) => v.kind === "car");
    if (i >= 0) traffic.vehicles.splice(i, 1);
  }
  if (trains < wantTrains) {
    const v = spawn("train", traffic.rails);
    if (v) traffic.vehicles.push(v);
  } else if (trains > wantTrains) {
    const i = traffic.vehicles.findIndex((v) => v.kind === "train");
    if (i >= 0) traffic.vehicles.splice(i, 1);
  }

  for (let i = traffic.vehicles.length - 1; i >= 0; i--) {
    const v = traffic.vehicles[i];
    const graph = v.kind === "car" ? traffic.roads : traffic.rails;
    v.dist += v.speed * dt;
    const index = Math.floor(v.dist);
    if (!extend(v.path, graph, 3, index)) {
      // slepá ulička: otoč se zpět po stejné trase
      v.path = v.path.slice(0, index + 1).reverse();
      v.dist = 0;
      if (v.path.length < 2) traffic.vehicles.splice(i, 1);
      continue;
    }
    // zahodíme ujetou část cesty, ale necháme zadní vagony vlaku
    const keep = index - (v.length + 1);
    if (keep > 8) {
      v.path.splice(0, keep);
      v.dist -= keep;
    }
  }
}

export type VehiclePart = { gx: number; gy: number; dx: number; dy: number; lead: boolean };

// Souřadnice (v dlaždicích, střed dlaždice je +0.5) a směr každého vagonu.
export function vehicleParts(v: Vehicle): VehiclePart[] {
  const parts: VehiclePart[] = [];
  for (let k = 0; k < v.length; k++) {
    const d = Math.max(0, v.dist - k * 0.72);
    const i = Math.min(v.path.length - 2, Math.floor(d));
    if (i < 0) continue;
    const t = d - i;
    const a = v.path[i];
    const b = v.path[i + 1];
    const ax = (a % CITY_SIZE) + 0.5;
    const ay = Math.floor(a / CITY_SIZE) + 0.5;
    const bx = (b % CITY_SIZE) + 0.5;
    const by = Math.floor(b / CITY_SIZE) + 0.5;
    parts.push({
      gx: ax + (bx - ax) * t,
      gy: ay + (by - ay) * t,
      dx: Math.sign(bx - ax),
      dy: Math.sign(by - ay),
      lead: k === 0,
    });
  }
  return parts;
}
