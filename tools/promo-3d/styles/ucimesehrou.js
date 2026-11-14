{
  // ---------------------------------------------------------------- content (change this block for a new topic)
  // Five stops on one route across a low-poly island. Each gets a paper flag planted in the world when the camera arrives.
  const STEPS = [['1', 'PŘEDMĚTY'], ['2', 'HRY'], ['3', 'AI DOUČOVAČ'], ['4', 'TÝMY'], ['5', 'PRO KOHO']];
  // Subjects shown as blocks that pop out of the ground: [label, palette key]
  const SUBJECTS = [['ČEŠTINA', 'coral'], ['MATEMATIKA', 'teal'], ['ANGLIČTINA', 'ochre'], ['CHEMIE', 'lilac'], ['DĚJEPIS', 'leaf'], ['HUDEBKA', 'shallow']];
  const GAMES = [['FARMA', 'farm'], ['MĚSTO', 'city'], ['MAZLÍČCI', 'pets']];
  const LEVELS = ['ZŠ', 'SŠ', 'PŘIJÍMAČKY', 'MATURITA'];
  const QUESTION = 'NECHÁPU ZLOMKY';
  const SIGN = 'ucimesehrou.org';
  // One schedule (seconds) for picture and sound.
  const T = {
    cubes: [-0.35, -0.25, -0.15, 0.0, 0.12, 0.24],
    flag1: -9,
    walk1: [2.3, 3.5],              // the pupil walks from the subjects to the games
    flag2: 2.95, games: [3.0, 3.25, 3.5],
    walk2: [4.8, 5.6],
    flag3: 5.3, robot: 5.25, q: 5.85, a: 6.2, slices: [6.55, 6.7, 6.85],
    walk3: [7.25, 7.9],
    flag4: 7.8, team: 7.55, scroll: 8.2, ticks: [8.75, 9.0, 9.25, 9.5],
    climb: [9.95, 11.75],
    flag5: 9.9, summit: 11.75, confetti: 11.8,
    end: 12.5,
  };

  // ---------------------------------------------------------------- the palette
  const PAL = {
    seaDeep: '#1f6a80', sea: '#2e8f9c', seaShallow: '#63bfb4', foam: '#e6f5ea',
    sand: '#ecd3a0', grass: '#a5bf66', meadow: '#86ad5c', forest: '#5d9160', pine: '#3f7d62', leaf: '#74a857', ochre: '#e0a646',
    rock: '#a3929b', rockDark: '#857a8c', snow: '#fffbf4', trunk: '#7d5e4e',
    cloud: '#fff8ef', cloudSide: '#f4e7de', cloudBase: '#c8c4dc',
    paper: '#fff6e4', ink: '#22303c', accent: '#e9684a', coral: '#e9684a', teal: '#2e8f9c', shallow: '#63bfb4', lilac: '#9a8cc0',
    skin: '#f0c9a0', brick: '#c9543c', stone: '#d9c9ad',
    skyTop: '#66a9cf', skyPale: '#f7ead9', haze: '#f8dcc0', sun: '#ffcf99',
  };
  const _hsl = {};
  function tone(hex, key, amount = 1) {
    const c = new THREE.Color(hex); c.getHSL(_hsl);
    return c.setHSL(_hsl.h + (K.hash(key, 1.3) - 0.5) * 0.03 * amount, K.clamp(_hsl.s * (1 + (K.hash(key, 7.7) - 0.5) * 0.22 * amount)), K.clamp(_hsl.l * (1 + (K.hash(key, 13.1) - 0.5) * 0.15 * amount)));
  }

  // ---------------------------------------------------------------- facet tools (work on any geometry)
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _n = new THREE.Vector3(), _m = new THREE.Vector3();
  const vkey = (p, i) => Math.round(p.getX(i) * 500) + ',' + Math.round(p.getY(i) * 500) + ',' + Math.round(p.getZ(i) * 500);

  function jitter(geo, amount, seed = 1) {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const k = Math.round(p.getX(i) * 500) * 0.731 + Math.round(p.getY(i) * 500) * 1.913 + Math.round(p.getZ(i) * 500) * 3.377 + seed * 17.17;
      p.setXYZ(i, p.getX(i) + (K.hash(k, 1) - 0.5) * 2 * amount, p.getY(i) + (K.hash(k, 2) - 0.5) * 2 * amount, p.getZ(i) + (K.hash(k, 3) - 0.5) * 2 * amount);
    }
    return geo;
  }
  function facet(src, paint) {
    const g = src.index ? src.toNonIndexed() : src, p = g.attributes.position, pos = [], col = [], nor = [], cen = [];
    for (let i = 0; i < p.count; i += 3) {
      _a.fromBufferAttribute(p, i); _b.fromBufferAttribute(p, i + 1); _c.fromBufferAttribute(p, i + 2);
      _n.subVectors(_b, _a).cross(_m.subVectors(_c, _a));
      if (_n.length() < 1e-6) continue;
      _n.normalize(); _m.copy(_a).add(_b).add(_c).divideScalar(3);
      const k = paint(_m, _n, i / 3);
      for (const v of [_a, _b, _c]) { pos.push(v.x, v.y, v.z); col.push(k.r, k.g, k.b); nor.push(_n.x, _n.y, _n.z); cen.push(_m.x, _m.y, _m.z); }
    }
    const out = new THREE.BufferGeometry();
    for (const [name, arr] of [['position', pos], ['color', col], ['normal', nor], ['aCen', cen]]) out.setAttribute(name, new THREE.Float32BufferAttribute(arr, 3));
    return out;
  }
  function merge(list) {
    const out = new THREE.BufferGeometry();
    for (const name of Object.keys(list[0].attributes)) {
      const size = list[0].attributes[name].itemSize, arr = new Float32Array(list.reduce((s, g) => s + g.attributes[name].array.length, 0));
      let o = 0; for (const g of list) { arr.set(g.attributes[name].array, o); o += g.attributes[name].array.length; }
      out.setAttribute(name, new THREE.BufferAttribute(arr, size));
    }
    return out;
  }
  function unfold(geo, { from = [0, 0, 0], speed = 3, duration = 0, start = 0 } = {}) {
    const p = geo.attributes.position, cen = geo.attributes.aCen, n = p.count / 3, edges = new Map(), nb = Array.from({ length: n }, () => []);
    for (let f = 0; f < n; f++) for (let e = 0; e < 3; e++) {
      const k0 = vkey(p, f * 3 + e), k1 = vkey(p, f * 3 + (e + 1) % 3), k = k0 < k1 ? k0 + '|' + k1 : k1 + '|' + k0, o = edges.get(k);
      if (o) { nb[f].push([o.f, e, o.e]); nb[o.f].push([f, o.e, e]); } else edges.set(k, { f, e });
    }
    const born = new Float32Array(n).fill(Infinity), hinge = new Int8Array(n), seen = new Uint8Array(n);
    const dist = (f, x, y, z) => Math.hypot(cen.getX(f * 3) - x, cen.getY(f * 3) - y, cen.getZ(f * 3) - z);
    for (let k = 0; k < n; k++) {
      let f = -1, best = Infinity;
      for (let i = 0; i < n; i++) if (!seen[i] && born[i] < best) { best = born[i]; f = i; }
      if (f < 0) {
        for (let i = 0; i < n; i++) if (!seen[i]) { const d = dist(i, from[0], from[1], from[2]); if (d < best) { best = d; f = i; } }
        born[f] = best / speed;
      }
      seen[f] = 1;
      for (const [g, , eg] of nb[f]) { const t = born[f] + dist(g, cen.getX(f * 3), cen.getY(f * 3), cen.getZ(f * 3)) / speed; if (!seen[g] && t < born[g]) { born[g] = t; hinge[g] = eg; } }
    }
    const last = Math.max(...born), pace = duration ? duration / last : 1;
    const A = new Float32Array(n * 9), B = new Float32Array(n * 9), bt = new Float32Array(n * 3);
    for (let f = 0; f < n; f++) {
      _a.fromBufferAttribute(p, f * 3 + (hinge[f] + 1) % 3); _b.fromBufferAttribute(p, f * 3 + hinge[f]);
      for (let v = 0; v < 3; v++) { _a.toArray(A, f * 9 + v * 3); _b.toArray(B, f * 9 + v * 3); bt[f * 3 + v] = start + born[f] * pace + K.hash(f, 3.1) * 0.04; }
    }
    geo.setAttribute('aHingeA', new THREE.BufferAttribute(A, 3)); geo.setAttribute('aHingeB', new THREE.BufferAttribute(B, 3)); geo.setAttribute('aBorn', new THREE.BufferAttribute(bt, 1));
    return geo;
  }
  const clock = { value: 0 };
  const WAVE = 'float seaWave(vec2 p, float t){ return sin(p.x * 1.25 + t * 1.35) * cos(p.y * 1.05 - t * 1.1) * 0.6 + sin(p.x * 2.7 - p.y * 2.2 + t * 2.3) * 0.4; }\n';
  function faceted(o = {}) {
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: o.roughness == null ? 0.9 : o.roughness, metalness: 0, side: o.unfold ? THREE.DoubleSide : THREE.FrontSide });
    const uniforms = Object.assign({ uTime: clock, uFold: { value: o.fold || 0.38 } }, o.uniforms || {});
    const patch = (sh, colour) => {
      Object.assign(sh.uniforms, uniforms);
      let head = 'uniform float uTime, uFold; attribute vec3 aCen;\n' + (o.head || ''), body = '';
      if (o.wave) { head += WAVE; body += `transformed.y += seaWave(transformed.xz, uTime) * ${o.wave.toFixed(4)};\n`; }
      if (o.unfold) {
        head += 'attribute vec3 aHingeA, aHingeB; attribute float aBorn;\n';
        body += `float fu = clamp((uTime - aBorn) / uFold, 0.0, 1.0);
          float fopen = 1.0 - pow(1.0 - fu, 3.0) + 0.3 * sin(fu * 3.14159) * fu * fu;
          float fang = (1.0 - fopen) * 2.4;
          vec3 fax = normalize(aHingeB - aHingeA), frel = transformed - aHingeA;
          frel = frel * cos(fang) + cross(fax, frel) * sin(fang) + fax * dot(fax, frel) * (1.0 - cos(fang));
          transformed = mix(0.5 * (aHingeA + aHingeB), aHingeA + frel, smoothstep(0.0, 0.45, fu));\n`;
      }
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + head).replace('#include <begin_vertex>', '#include <begin_vertex>\n' + body);
      if (colour && o.tint) sh.vertexShader = sh.vertexShader.replace('#include <color_vertex>', '#include <color_vertex>\n' + o.tint);
    };
    const id = JSON.stringify([o.wave, o.unfold, o.tint, o.head, o.glow]);
    m.onBeforeCompile = (sh) => {
      patch(sh, true);
      if (o.glow) sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * ${o.glow.toFixed(3)};`);
    };
    m.customProgramCacheKey = () => 'facet' + id;
    if (o.unfold || o.wave) {
      m.depth = new THREE.MeshDepthMaterial({ side: m.side });
      m.depth.onBeforeCompile = (sh) => patch(sh, false); m.depth.customProgramCacheKey = () => 'facetDepth' + id;
    }
    return m;
  }
  const mesh = (geo, mat, o = {}) => { const m = new THREE.Mesh(geo, mat); m.castShadow = o.cast !== false; m.receiveShadow = true; if (mat.depth) m.customDepthMaterial = mat.depth; return m; };

  // ---------------------------------------------------------------- ground tools
  function scatter([x0, z0, x1, z1], spacing, seed, root = 11) {
    const r = K.rng(seed), out = [];
    const cell = (x, z, s) => { if (s > spacing(x + s / 2, z + s / 2)) { const h = s / 2; cell(x, z, h); cell(x + h, z, h); cell(x, z + h, h); cell(x + h, z + h, h); } else out.push([x + s * r.range(0.15, 0.85), z + s * r.range(0.15, 0.85)]); };
    for (let x = x0; x < x1; x += root) for (let z = z0; z < z1; z += root) cell(x, z, root);
    return out;
  }
  function triangulate(pts) {
    const n = pts.length, P = pts.concat([[-4e3, -4e3], [4e3, -4e3], [0, 4e3]]);
    const circ = (a, b, c) => {
      const [ax, ay] = P[a], [bx, by] = P[b], [cx, cy] = P[c], d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
      const x = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d, y = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;
      return { a, b, c, x, y, r2: (ax - x) * (ax - x) + (ay - y) * (ay - y) };
    };
    let open = [circ(n, n + 1, n + 2)]; const done = [];
    for (const i of pts.map((_, k) => k).sort((u, v) => P[u][0] - P[v][0])) {
      const [px, py] = P[i], edge = new Map(), keep = [];
      for (const t of open) {
        const dx = px - t.x, dy = py - t.y;
        if (dx > 0 && dx * dx > t.r2) { done.push(t); continue; }
        if (dx * dx + dy * dy >= t.r2) { keep.push(t); continue; }
        for (const [u, v] of [[t.a, t.b], [t.b, t.c], [t.c, t.a]]) { const k = u < v ? u * 1e6 + v : v * 1e6 + u; if (edge.has(k)) edge.delete(k); else edge.set(k, [u, v]); }
      }
      open = keep; for (const [u, v] of edge.values()) open.push(circ(u, v, i));
    }
    return done.concat(open).filter((t) => t.a < n && t.b < n && t.c < n).map((t) => [t.a, t.b, t.c]);
  }
  function upward(tris) {
    const pos = [];
    for (const [a, b, c] of tris) { const up = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]); pos.push(...a, ...(up < 0 ? c : b), ...(up < 0 ? b : c)); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }
  const surface = (pts, height) => upward(triangulate(pts).map((tri) => tri.map((i) => [pts[i][0], pts[i][2] == null ? height(pts[i][0], pts[i][1]) : pts[i][2], pts[i][1]])));

  // ---------------------------------------------------------------- props: every shape is a jittered primitive, cut flat where it helps
  function rockGeo(seed) {
    const g = jitter(new THREE.IcosahedronGeometry(0.5, 1), 0.11, seed); g.scale(1.15, 0.72, 0.9);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < -0.12) p.setY(i, -0.12);
    return facet(g, (c, n) => tone(n.y > 0.55 ? PAL.rock : PAL.rockDark, c.x * 31 + c.y * 17 + c.z * 7 + seed));
  }
  function pineGeo(seed, slim = 1) {
    const r = K.rng(seed), parts = [];
    const trunk = new THREE.CylinderGeometry(0.04, 0.06, 0.26, 5); trunk.translate(0, 0.13, 0);
    parts.push(facet(trunk, (c) => tone(PAL.trunk, c.x * 9 + c.z * 5 + c.y)));
    [[0.33, 0.46, 0.2], [0.25, 0.42, 0.5], [0.165, 0.4, 0.78]].forEach(([rad, h, y], i) => {
      const g = jitter(new THREE.ConeGeometry(rad * slim, h, 6, 1), 0.022, seed + i);
      g.rotateZ(r.range(-0.07, 0.07)); g.rotateY(r.range(0, 6.28)); g.translate(r.range(-0.015, 0.015), y + h / 2, r.range(-0.015, 0.015));
      parts.push(facet(g, (c, n) => tone(PAL.pine, c.x * 13 + c.y * 7 + c.z * 3 + seed, 1).multiplyScalar(n.y < -0.5 ? 0.6 : 1 + i * 0.1)));
    });
    return merge(parts);
  }
  function treeGeo(seed, colour) {
    const parts = [], trunk = new THREE.CylinderGeometry(0.035, 0.055, 0.42, 5); trunk.translate(0, 0.21, 0);
    parts.push(facet(trunk, (c) => tone(PAL.trunk, c.x * 9 + c.z * 5 + c.y)));
    [[0, 0.68, 0, 0.36], [0.2, 0.52, 0.08, 0.22]].forEach(([x, y, z, rad], i) => {
      const g = jitter(new THREE.IcosahedronGeometry(rad, 1), rad * 0.16, seed + i * 3); g.scale(1, 0.92, 1); g.translate(x, y, z);
      parts.push(facet(g, (c, n) => tone(colour, c.x * 13 + c.y * 7 + c.z * 3 + seed, 1.2).multiplyScalar(0.92 + 0.14 * n.y)));
    });
    return merge(parts);
  }
  function cloudGeo(puffs, seed) {
    return merge(puffs.map(([x, y, z, rad], i) => {
      const g = jitter(new THREE.IcosahedronGeometry(rad, 1), rad * 0.12, seed + i * 5); g.scale(1, 0.86, 0.92); g.translate(x, y, z);
      const p = g.attributes.position, base = -0.012 * i; for (let k = 0; k < p.count; k++) if (p.getY(k) < base) p.setY(k, base);
      return facet(g, (c, n) => tone(n.y < -0.5 ? PAL.cloudBase : n.y > 0.3 ? PAL.cloud : PAL.cloudSide, c.x * 11 + c.y * 5 + c.z * 3 + seed + i, 0.55));
    }));
  }
  function gemGeo(w, h) { const g = new THREE.OctahedronGeometry(1, 0); g.scale(w, h, w); return facet(g, () => new THREE.Color(1, 1, 1)); }
  function boatGeo() {
    const P = { bow: [0.36, 0.13, 0], stern: [-0.36, 0.13, 0], l: [0, 0.11, 0.12], r: [0, 0.11, -0.12], keel: [0, -0.05, 0], mast: [0.02, 0.56, 0], s0: [-0.2, 0.14, 0], s1: [0.22, 0.14, 0] };
    const tris = [['bow', 'l', 'keel'], ['l', 'stern', 'keel'], ['stern', 'r', 'keel'], ['r', 'bow', 'keel'], ['bow', 'stern', 'l'], ['bow', 'r', 'stern'], ['s0', 's1', 'mast'], ['s1', 's0', 'mast']];
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(tris.flatMap((t) => t.flatMap((k) => P[k])), 3));
    return facet(g, (c, n, i) => tone(i >= 6 ? PAL.accent : PAL.paper, i, 0.6));
  }
  // a generic jittered, faceted box / cylinder / cone, with a colour (or a function of the facet)
  const solid = (geo, col, seed = 1, jit = 0.012, amt = 0.8) => facet(jitter(geo, jit, seed), (c, n, i) => (typeof col === 'function' ? col(c, n, i) : tone(col, c.x * 17 + c.y * 9 + c.z * 5 + seed * 3.1, amt)));
  const box = (w, h, d, col, seed, jit) => solid(new THREE.BoxGeometry(w, h, d, 2, 2, 2), col, seed, jit);
  const lift = (g, y) => { g.translate(0, y, 0); return g; };

  // A paper flag on a pin. num = null makes a plain word tag. scale shrinks the whole flag; side = 1 hangs it to the right of the pin.
  function flag(num, word, { height = 1.25, side = 1, scale = 1 } = {}) {
    const FONT = '700 150px "Oswald"', PXH = 250, BH = 0.64 * scale, u = BH / PXH, gap = 34, pad = 50, notch = 70;
    const meas = document.createElement('canvas').getContext('2d'); meas.font = FONT; meas.letterSpacing = '7px';
    const label = num == null ? '' : String(num);
    const wn = label ? meas.measureText(label).width : 0, ww = meas.measureText(word).width, W = Math.ceil(pad + wn + (label ? gap : 0) + ww + pad + notch);
    const x0 = side > 0 ? pad : notch + pad;
    const tex = K.canvasTex(W, PXH, (ctx) => {
      ctx.fillStyle = PAL.paper; ctx.fillRect(0, 0, W, PXH);
      ctx.font = FONT; ctx.letterSpacing = '7px'; ctx.textBaseline = 'alphabetic';
      if (label) { ctx.fillStyle = PAL.accent; ctx.fillText(label, x0, PXH / 2 + 60); }
      ctx.fillStyle = PAL.ink; ctx.fillText(word, x0 + wn + (label ? gap : 0), PXH / 2 + 60);
    });
    const w = W * u, s = new THREE.Shape();
    s.moveTo(0, 0); s.lineTo(w, 0); s.lineTo(w - notch * u, BH / 2); s.lineTo(w, BH); s.lineTo(0, BH); s.closePath();
    const sg = new THREE.ShapeGeometry(s), uv = sg.attributes.uv, sp = sg.attributes.position;
    for (let i = 0; i < sp.count; i++) { const fx = sp.getX(i) / w; uv.setXY(i, side > 0 ? fx : 1 - fx, sp.getY(i) / BH); if (side < 0) sp.setX(i, -sp.getX(i)); }
    if (side < 0) sg.index.array.reverse();
    const board = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: '#ffffff', emissiveIntensity: 0.3, roughness: 0.95, side: THREE.DoubleSide }));
    board.position.set(0, height - BH - 0.05, 0.03); board.castShadow = true; board.receiveShadow = true;
    const pg = new THREE.CylinderGeometry(0.02 * scale, 0.02 * scale, height, 5); pg.translate(0, height / 2, 0);
    const pole = new THREE.Group(), pin = mesh(facet(pg, () => new THREE.Color(PAL.ink)), faceted({ roughness: 0.6 }));
    const head = mesh(facet(new THREE.IcosahedronGeometry(0.075 * scale, 0), (c, n, i) => tone(PAL.accent, i, 0.7)), faceted({ roughness: 0.5 })); head.position.y = height + 0.04;
    pole.add(pin, head, board);
    const group = new THREE.Group(); group.add(pole);
    const pop = (t, t0) => {
      const a = K.spring(t - t0, 2.6, 0.38), b = K.spring(t - t0 - 0.14, 2.1, 0.42);
      group.visible = t > t0; pole.scale.set(1, Math.max(0.001, a), 1);
      board.rotation.y = side * (1 - b) * -1.9; board.scale.set(Math.max(0.001, K.seg(t, t0 + 0.12, t0 + 0.34, K.ease.out)), 1, 1);
    };
    return { group, pop, width: w };
  }

  registerStyle({
    id: 'low-poly-ucimesehrou',
    name: 'Low-Poly',
    family: 'Filters over 3D',
    look: 'A miniature world of flat, faceted shapes, like folded paper or cut stone: every triangle is one tone, and neighbours differ slightly, inside a short palette of sand, coral and cream against teal water and sage greens.',
    topic: 'ucimesehrou.org: subjects, games, the AI tutor, teams, and who it is for',
    duration: T.end,
    fonts: ['700 150px "Oswald"'],
    render: { samples: 64, shutter: 0.4, tone: 'neutral', exposure: 1.0, bloom: 0.35, bloomThreshold: 1.25, vignette: 0.22, grain: 0.014, fov: 30, background: PAL.haze, far: 400 },

    build(S) {
      const { THREE, K, scene, camera } = S;
      const N = K.noise(7), smooth = K.smooth, TX = (txt, h, color = PAL.ink, extra = {}) => K.textPlane(txt, Object.assign({ font: '700 150px "Oswald"', color, height: h, pad: 24, lineHeight: 1.0 }, extra));

      // ------------------------------------------------------------ the place: one island, a plain for the stops and a mountain at the end
      const PEAKS = [[12.6, -6.9, 6.3, 6.9], [5.5, -12, 3.6, 6], [-3, -12, 2.6, 6.5], [18, -4, 3.8, 6], [-12.5, -8, 2.4, 5], [1, -20, 5.5, 9], [15, -18, 6.5, 9], [-20, -16, 5, 9]];
      const peak = (x, z, p, i) => {
        const dx = x - p[0], dz = z - p[1], a = Math.atan2(dz, dx);
        const r = p[3] * (1 + 0.17 * Math.sin(a * 3 + i * 1.9) + 0.09 * Math.sin(a * 5 + i * 3.1) + 0.05 * Math.sin(a * 9 + i));
        return p[2] * Math.pow(Math.max(0, 1 - Math.hypot(dx, dz) / r), 1.35);
      };
      const smin = (a, b, k) => { const h = K.clamp(0.5 + 0.5 * (b - a) / k); return K.lerp(b, a, h) - k * h * (1 - h); };
      const coast = (x, z) => smin(x + 10.8 + 0.45 * Math.sin(z * 0.7 + 0.5), 6.4 - z + 0.35 * Math.sin(x * 0.5 + 1), 1.8) + 0.3 * N.fbm(x * 0.35, z * 0.35, 0, 3);
      const height = (x, z) => {
        const d = coast(x, z);
        if (d <= 0) return Math.max(-1.7, d * 0.55);
        let m = 0; PEAKS.forEach((p, i) => { m += Math.pow(peak(x, z, p, i), 4); }); m = Math.pow(m, 0.25);
        return 0.1 + 0.45 * (1 - Math.exp(-d * 0.5)) + 0.012 * d + m * smooth(0.2, 2.6, d) + N.fbm(x * 0.6, z * 0.6, 1, 3) * (0.05 + 0.3 * smooth(0.3, 1.6, m)) * smooth(0, 1, d);
      };

      // The route: a curve the pupil walks and the stones follow. Stops sit beside it; the last part climbs the mountain.
      const ROUTE = [[-10.9, 3.0], [-10.3, 2.9], [-6.0, 3.1], [-3.6, 3.0], [-1.2, 3.0], [0.6, 2.7], [2.2, 2.7], [4.3, 2.6], [6.0, 2.2], [7.4, 1.2], [8.7, -0.1], [9.6, -1.2], [10.5, -2.2], [11.2, -3.2], [10.9, -4.3], [11.6, -5.1], [12.3, -6.3]];
      const curve = new THREE.CatmullRomCurve3(ROUTE.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
      const ROUTE_LEN = curve.getLength();
      const RS = Array.from({ length: 400 }, (_, i) => { const u = i / 399, p = curve.getPointAt(u); return { u, x: p.x, z: p.z }; });
      const uAtX = (x) => { for (const r of RS) if (r.x >= x) return r.u; return 1; };
      const U = { s1: uAtX(-10.3), s2: uAtX(-1.2), s3: uAtX(2.2), s4: uAtX(6.0), base: uAtX(7.4) };
      const routeDist = (x, z) => { let d = Infinity; for (const r of RS) d = Math.min(d, Math.hypot(r.x - x, r.z - z)); return d; };
      const onRoute = (u) => { const p = curve.getPointAt(K.clamp(u)), t = curve.getTangentAt(K.clamp(u)); return { x: p.x, z: p.z, y: height(p.x, p.z), tx: t.x, tz: t.z }; };

      // ------------------------------------------------------------ light, sky and haze
      const SUN = new THREE.Vector3(-0.78, 0.4, 0.3).normalize();
      K.env(S, { top: '#7db7dd', horizon: '#ffe2c4', bottom: '#8fa98a', intensity: 0.55, panels: [{ pos: [SUN.x * 30, SUN.y * 30, SUN.z * 30], size: [10, 10], color: PAL.sun, power: 14, round: true }] });
      K.sun(S, { pos: [SUN.x * 45 + 4, SUN.y * 45, SUN.z * 45], target: [3, 0, 0], color: '#ffe0ba', power: 3.5, size: 19, soft: 2.2, mapSize: 4096, far: 120, normalBias: 0.03 });
      K.skyLight(S, { color: '#a9c9ff', power: 0.9, size: 17, center: [3, 1, 0], mapSize: 2048, spread: 0.9 });
      scene.fog = new THREE.Fog(PAL.haze, 14, 60);
      const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), new THREE.ShaderMaterial({
        side: THREE.BackSide, depthWrite: false, fog: false,
        uniforms: { top: { value: new THREE.Color(PAL.skyTop) }, pale: { value: new THREE.Color(PAL.skyPale) }, haze: { value: new THREE.Color(PAL.haze) }, sunC: { value: new THREE.Color(PAL.sun) }, sunDir: { value: SUN } },
        vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `varying vec3 vD; uniform vec3 top, haze, pale, sunC, sunDir;
          void main(){ vec3 d = normalize(vD); float s = max(dot(d, sunDir), 0.0);
            float y = max(d.y, 0.0);
            vec3 c = mix(mix(haze, pale, smoothstep(0.0, 0.12, y)), top, smoothstep(0.06, 0.5, y));
            c += sunC * (pow(s, 5.0) * 0.35 + pow(s, 40.0) * 0.8 + smoothstep(0.9988, 0.9992, s) * 5.0);
            gl_FragColor = vec4(c, 1.0); }`,
      }));
      scene.add(sky);

      // ------------------------------------------------------------ land
      const hero = (x, z) => Math.max(Math.abs(x - 2.5) - 13, -9.5 - z, z - 8.5, 0);
      const landPts = scatter([-55, -77, 55, 11], (x, z) => 0.69 * (1 + hero(x, z) * 0.2), 3);
      PEAKS.forEach((p) => landPts.push([p[0], p[1]]));
      const paintLand = (c, n) => {
        const key = c.x * 12.9898 + c.z * 78.233 + c.y * 37.7, j = K.hash(key, 5) - 0.5;
        let name;
        if (c.y < 0.15 + j * 0.08) name = 'sand';
        else if (c.y > 4.3 + j * 0.5 && n.y > 0.5) name = 'snow';
        else if (n.y < 0.74 + j * 0.06 || c.y > 3.6) name = K.hash(key, 9) < 0.6 ? 'rock' : 'rockDark';
        else if (c.y > 1.7 + j * 0.5) name = 'forest';
        else name = N.fbm(c.x * 0.3, c.z * 0.3, 3, 2) > 0.02 ? 'meadow' : 'grass';
        return tone(PAL[name], key, name === 'snow' ? 0.35 : 1);
      };
      scene.add(mesh(facet(surface(landPts, height), paintLand), faceted()));

      // sea: the same kind of mesh, heaving, coloured by depth
      const seaPts = scatter([-121, -121, 99, 33], (x, z) => 0.69 * (1 + hero(x, z) * 0.25), 5);
      const paintSea = (c) => { const depth = -height(c.x, c.z), key = c.x * 3.1 + c.z * 7.7; return tone(depth < 0.055 ? PAL.foam : depth < 0.36 ? PAL.seaShallow : depth < 1.0 ? PAL.sea : PAL.seaDeep, key, 1.1); };
      scene.add(mesh(facet(surface(seaPts, () => 0), paintSea), faceted({ roughness: 0.3, wave: 0.075 }), { cast: false }));

      // ------------------------------------------------------------ trees and rocks: placed by rules, kept clear of the stops and the route
      const STOPS = [[-11, -2.8, -4.6, 4.0], [-4.8, -2.8, 1.4, 3.8], [0.8, -2.0, 5.4, 3.8], [5.0, -2.0, 8.8, 3.6]];   // x0, z0, x1, z1 boxes where nothing grows
      const slope = (x, z) => Math.hypot(height(x + 0.2, z) - height(x - 0.2, z), height(x, z + 0.2) - height(x, z - 0.2)) / 0.4;
      const plants = { pine: [], pine2: [], tree: [], ochre: [], rock: [], rock2: [] };
      {
        const r = K.rng(21), taken = [];
        const free = (x, z, gap) => taken.every((q) => Math.hypot(q[0] - x, q[1] - z) > gap);
        const clear = (x, z) => STOPS.some(([x0, z0, x1, z1]) => x > x0 && x < x1 && z > z0 && z < z1) || routeDist(x, z) < 1.1;
        const put = (kind, x, z, s) => { taken.push([x, z]); plants[kind].push({ x, z, y: height(x, z) - 0.03, s, rot: r.range(0, 6.28), lean: r.range(-0.06, 0.06) }); };
        for (let i = 0; i < 3200; i++) {
          const x = r.range(-12, 20), z = r.range(-13, 6.2), y = height(x, z);
          if (y < 0.2 || clear(x, z)) continue;
          const sl = slope(x, z), grove = N.fbm(x * 0.45, z * 0.45, 9, 2);
          if (y > 0.75 && y < 3.4 && sl < 1.15 && grove > -0.08 && free(x, z, 0.36)) put(r.chance(0.5) ? 'pine' : 'pine2', x, z, r.range(0.62, 1.0) * (1.15 - y * 0.08));
          else if (y < 0.8 && sl < 0.5 && grove > 0.1 && free(x, z, 0.55)) put(r.chance(0.16) ? 'ochre' : r.chance(0.3) ? 'pine' : 'tree', x, z, r.range(0.6, 1.0));
        }
        for (let i = 0; i < 600; i++) {
          const x = r.range(-12, 12), z = r.range(-9, 6.5), y = height(x, z);
          if (clear(x, z) || !free(x, z, 0.5)) continue;
          if ((y > -0.12 && y < 0.1 && r.chance(0.4)) || (y > 2.2 && y < 3.6 && r.chance(0.12))) put(r.chance(0.5) ? 'rock' : 'rock2', x, z, r.range(0.22, 0.6));
        }
      }
      const kinds = { pine: pineGeo(1), pine2: pineGeo(2, 0.8), tree: treeGeo(3, PAL.leaf), ochre: treeGeo(4, PAL.ochre), rock: rockGeo(5), rock2: rockGeo(6) };
      const plantMat = faceted(), inst = {};
      for (const k of Object.keys(kinds)) {
        const m = inst[k] = new THREE.InstancedMesh(kinds[k], plantMat, Math.max(1, plants[k].length)); m.count = plants[k].length; m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m);
        plants[k].forEach((q, i) => { m.setColorAt(i, new THREE.Color().setScalar(0.9 + 0.2 * K.hash(q.x, q.z))); K.place(m, i, [q.x, q.y, q.z], [q.lean, q.rot, q.lean * 0.7], q.s); });
        m.instanceMatrix.needsUpdate = true;
      }

      // ------------------------------------------------------------ clouds (drifting, no story) and a paper boat
      [[[-8, 6.4, -9], 1.6, 11], [[9.5, 8.6, -14], 2.0, 12], [[-22, 7.5, -26], 2.6, 13], [[2, 9.5, -22], 2.4, 14], [[20, 8, -20], 2.2, 15]].forEach(([pos, s, seed]) => {
        const m = mesh(cloudGeo([[0, 0.25, 0, 0.9], [-0.95, 0.1, 0.1, 0.65], [0.9, 0.12, 0, 0.7], [1.6, 0.02, 0.1, 0.42]], seed), faceted({ glow: 0.22 })); m.position.set(...pos); m.scale.setScalar(s); m.userData.base = pos; scene.add(m); (S._clouds = S._clouds || []).push(m);
      });
      const boat = mesh(boatGeo(), faceted({ roughness: 0.8 })); boat.material.side = THREE.DoubleSide; scene.add(boat);

      // ------------------------------------------------------------ people and a robot, built from the same facets
      function person(shirt, { s = 1, hair = PAL.ink, seed = 1 } = {}) {
        const g = new THREE.Group(), mat = faceted({ roughness: 0.85 });
        const part = (geo, col, k, amt) => mesh(solid(geo, col, seed * 10 + k, 0.006, amt == null ? 0.7 : amt), mat);
        const mkLeg = (x) => { const p = new THREE.Group(); p.position.set(x, 0.3, 0); p.add(part(lift(new THREE.BoxGeometry(0.1, 0.3, 0.1, 1, 2, 1), -0.15), PAL.ink, 1)); g.add(p); return p; };
        const legL = mkLeg(-0.07), legR = mkLeg(0.07);
        const body = part(lift(new THREE.CylinderGeometry(0.13, 0.17, 0.36, 6, 1), 0.48), shirt, 2); g.add(body);
        const mkArm = (x) => { const p = new THREE.Group(); p.position.set(x, 0.62, 0); p.add(part(lift(new THREE.BoxGeometry(0.075, 0.3, 0.075, 1, 2, 1), -0.14), shirt, 3)); const hand = part(new THREE.IcosahedronGeometry(0.045, 0), PAL.skin, 4); hand.position.y = -0.3; p.add(hand); g.add(p); return p; };
        const armL = mkArm(-0.21), armR = mkArm(0.21);
        const head = part(new THREE.IcosahedronGeometry(0.16, 1), PAL.skin, 5, 0.4); head.position.y = 0.84; g.add(head);
        const hg = new THREE.IcosahedronGeometry(0.172, 1), hp = hg.attributes.position; for (let i = 0; i < hp.count; i++) if (hp.getY(i) < 0.0) hp.setY(i, hp.getY(i) * 0.15);
        const hr = part(hg, hair, 6, 0.9); hr.position.set(0, 0.86, -0.012); g.add(hr);
        for (const x of [-0.06, 0.06]) { const e = mesh(solid(new THREE.IcosahedronGeometry(0.02, 0), PAL.ink, 7, 0, 0), mat); e.position.set(x, 0.84, 0.15); g.add(e); }
        g.scale.setScalar(s);
        return { group: g, legL, legR, armL, armR, head };
      }
      // pose(): phase drives the walk cycle, walk (0..1) its strength, up raises both arms, wave swings the right arm, hop lifts the body
      function pose(p, { phase = 0, walk = 0, up = 0, wave = 0, hop = 0 } = {}) {
        const sw = Math.sin(phase) * 0.7 * walk;
        p.legL.rotation.x = sw; p.legR.rotation.x = -sw;
        p.armL.rotation.set(-sw * 0.8 - up * 2.6, 0, 0.12 + up * 0.4); p.armR.rotation.set(sw * 0.8 - up * 2.6 - wave * 2.2, 0, -0.12 - up * 0.4 - wave * 0.5 * Math.sin(phase));
        p.group.position.y += Math.abs(Math.sin(phase)) * 0.04 * walk + hop;   // on top of the ground height set by the caller
      }
      const pupil = person(PAL.coral, { seed: 1, hair: '#5a3d33', s: 1.6 });
      scene.add(pupil.group);
      const mates = [[PAL.teal, 2, '#3a2a28'], [PAL.ochre, 3, PAL.ink], [PAL.lilac, 4, '#7d5e4e']].map(([c, sd, hr]) => { const p = person(c, { seed: sd, hair: hr, s: 1.5 }); scene.add(p.group); return p; });
      const teacher = person(PAL.ink, { seed: 6, s: 1.9, hair: '#a3929b' }); scene.add(teacher.group);
      const clip = mesh(box(0.2, 0.28, 0.03, PAL.paper, 3, 0.003), faceted({ roughness: 0.8 })); clip.position.set(0.01, -0.3, 0.07); clip.rotation.x = 0.3; teacher.armR.add(clip);

      function robotBuild() {
        const g = new THREE.Group(), mat = faceted({ roughness: 0.7 });
        const mk = (geo, col, k, jit = 0.01) => mesh(solid(geo, col, 20 + k, jit, 0.6), mat);
        const feet = mk(lift(new THREE.BoxGeometry(0.62, 0.1, 0.46, 2, 1, 2), 0.05), PAL.rockDark, 1); g.add(feet);
        const body = mk(lift(new THREE.BoxGeometry(0.56, 0.6, 0.42, 2, 2, 2), 0.4), PAL.paper, 2, 0.02); g.add(body);
        const plate = mk(new THREE.BoxGeometry(0.34, 0.2, 0.04, 1, 1, 1), PAL.teal, 3, 0.004); plate.position.set(0, 0.42, 0.22); g.add(plate);
        const head = new THREE.Group(); head.position.y = 0.88; g.add(head);
        const hbox = mk(new THREE.BoxGeometry(0.62, 0.42, 0.46, 2, 2, 2), PAL.teal, 4, 0.02); head.add(hbox);
        const visor = mk(new THREE.BoxGeometry(0.46, 0.2, 0.04, 1, 1, 1), PAL.paper, 5, 0.004); visor.position.set(0, 0.02, 0.24); head.add(visor);
        const eyeMat = new THREE.MeshStandardMaterial({ color: PAL.ink, emissive: '#7fe3d3', emissiveIntensity: 1.2, flatShading: true });
        const eyes = [-0.1, 0.1].map((x) => { const e = new THREE.Mesh(new THREE.IcosahedronGeometry(0.04, 0), eyeMat); e.position.set(x, 0.02, 0.27); head.add(e); return e; });
        const ant = mk(lift(new THREE.CylinderGeometry(0.014, 0.014, 0.2, 5), 0.31), PAL.ink, 6, 0); head.add(ant);
        const ball = mk(new THREE.IcosahedronGeometry(0.06, 0), PAL.coral, 7, 0.004); ball.position.y = 0.54; head.add(ball);
        const mkArm = (x) => { const p = new THREE.Group(); p.position.set(x, 0.62, 0); p.add(mk(lift(new THREE.BoxGeometry(0.1, 0.34, 0.1, 1, 2, 1), -0.16), PAL.teal, 8, 0.006)); g.add(p); return p; };
        const armL = mkArm(-0.34), armR = mkArm(0.34);
        return { group: g, head, armL, armR, eyes, ball };
      }
      const robot = robotBuild(); scene.add(robot.group);

      // ------------------------------------------------------------ stop 1: subject blocks that pop out of the ground
      const CUBE_X = [-9.3, -7.5, -5.7], CUBE_Z = [1.5, -1.6];
      const cubes = SUBJECTS.map(([label, key], i) => {
        const cx = CUBE_X[i % 3], cz = CUBE_Z[Math.floor(i / 3)], g = new THREE.Group();
        const CH = i < 3 ? 1.2 : 1.7, geo = solid(new THREE.BoxGeometry(1.5, CH, 1.5, 3, 3, 3), (c, n, k) => tone(PAL[key], c.x * 21 + c.y * 9 + c.z * 13 + i * 5, n.y > 0.5 ? 0.9 : 1).multiplyScalar(n.y > 0.5 ? 1.08 : n.z > 0.5 ? 1 : 0.9), i + 40, 0.03);
        const m = mesh(geo, faceted({ roughness: 0.85 })); m.position.y = CH / 2; g.add(m);
        const tp = TX(label, 0.3), [tw, th] = tp.userData.size, plateW = Math.min(1.44, tw + 0.08);
        if (tw + 0.08 > 1.44) tp.scale.setScalar(1.36 / tw);
        const plate = new THREE.Mesh(K.roundedRect(plateW, 0.46, 0.08), new THREE.MeshStandardMaterial({ color: PAL.paper, emissive: PAL.paper, emissiveIntensity: 0.3, roughness: 0.95 }));
        plate.position.set(0, i < 3 ? 0.55 : 1.1, 0.8); plate.castShadow = true; tp.position.z = 0.004; plate.add(tp); g.add(plate);
        g.position.set(cx, height(cx, cz) - 0.03, cz); g.rotation.y = (i % 2 ? 1 : -1) * 0.05; scene.add(g);
        return { g, t0: T.cubes[i], tp };
      });
      const flags = [
        flag(...STEPS[0], { height: 3.5, side: 1 }), flag(...STEPS[1], { height: 3.5, side: 1 }),
        flag(...STEPS[2], { height: 4.4, side: 1 }), flag(...STEPS[3], { height: 4.9, side: 1 }), flag(...STEPS[4], { height: 2.7, side: 1 }),
      ];
      const FLAG_AT = [[-10.3, -2.0], [-4.9, -2.0], [-1.9, -2.0], [4.9, -1.7], [9.4, 1.8]];
      const FLAG_T = [T.flag1, T.flag2, T.flag3, T.flag4, T.flag5];
      flags.forEach((f, i) => { const [x, z] = FLAG_AT[i]; f.group.position.set(x, height(x, z) - 0.02, z); scene.add(f.group); });
      // a signpost at the start of the route
      const sign = (() => {
        const g = new THREE.Group(), tp = TX(SIGN, 0.2), [tw] = tp.userData.size;
        const post = mesh(facet(lift(new THREE.CylinderGeometry(0.05, 0.07, 1.3, 5), 0.65), (c) => tone(PAL.trunk, c.y * 9 + c.x * 5)), faceted());
        const board = new THREE.Mesh(K.roundedRect(tw + 0.3, 0.52, 0.08), new THREE.MeshStandardMaterial({ color: PAL.paper, emissive: PAL.paper, emissiveIntensity: 0.3, roughness: 0.95, side: THREE.DoubleSide }));
        board.position.set(0.1, 1.1, 0.07); board.castShadow = true; tp.position.z = 0.01; board.add(tp); g.add(post, board);
        g.position.set(-11.0, height(-11.0, 1.0) - 0.02, 1.0); g.rotation.y = 0.5; scene.add(g); return g;
      })();

      // ------------------------------------------------------------ stop 2: three miniature game worlds, each on its own round plot
      const PLOT_X = [-3.4, -1.2, 1.0], PLOT_Z = 0.4;
      function plotBase(kind) {
        const g = solid(new THREE.CylinderGeometry(0.86, 0.96, 0.18, 8, 1), (c, n) => tone(n.y > 0.5 ? (kind === 'farm' ? PAL.meadow : kind === 'city' ? PAL.stone : PAL.grass) : PAL.sand, c.x * 9 + c.z * 7 + c.y, 0.9), 60, 0.02);
        return mesh(lift(g, 0.09), faceted({ roughness: 0.9 }));
      }
      const roof = (w, d, h, col, seed) => { const g = new THREE.ConeGeometry(0.5, h, 4, 1); g.rotateY(Math.PI / 4); g.scale(w / 0.707, 1, d / 0.707); return mesh(solid(lift(g, h / 2), col, seed, 0.006), faceted({ roughness: 0.85 })); };
      const piece = (geo, col, seed, y, x = 0, z = 0) => { const m = mesh(solid(geo, col, seed, 0.01), faceted({ roughness: 0.85 })); m.position.set(x, y, z); return m; };
      const plots = [0, 1, 2].map((i) => {
        const g = new THREE.Group(), kind = GAMES[i][1];
        g.add(plotBase(kind));
        if (kind === 'farm') {
          g.add(piece(new THREE.BoxGeometry(0.62, 0.4, 0.5, 2, 2, 2), PAL.brick, 61, 0.38, -0.2, -0.12));
          const r = roof(0.76, 0.6, 0.3, PAL.sand, 62); r.position.set(-0.2, 0.58, -0.12); g.add(r);
          g.add(piece(new THREE.CylinderGeometry(0.15, 0.15, 0.62, 7, 1), PAL.paper, 63, 0.5, 0.36, -0.28));
          const cap = roof(0.3, 0.3, 0.2, PAL.ochre, 64); cap.position.set(0.36, 0.81, -0.28); g.add(cap);
          for (let k = 0; k < 4; k++) g.add(piece(new THREE.BoxGeometry(0.58, 0.06, 0.1, 2, 1, 1), k % 2 ? PAL.leaf : PAL.ochre, 65 + k, 0.21, 0.02, 0.2 + k * 0.14));
        } else if (kind === 'city') {
          [[-0.3, -0.1, 0.34, 0.9, PAL.paper], [0.02, -0.2, 0.36, 1.25, PAL.teal], [0.34, -0.05, 0.3, 0.7, PAL.sand], [-0.12, 0.28, 0.3, 0.55, PAL.lilac], [0.28, 0.3, 0.26, 0.42, PAL.coral]].forEach(([x, z, w, h, c], k) => {
            const m = piece(new THREE.BoxGeometry(w, h, w, 2, 3, 2), c, 70 + k, 0.18 + h / 2, x, z); g.add(m);
            const ro = roof(w * 1.05, w * 1.05, 0.14, PAL.ink, 76 + k); ro.position.set(x, 0.18 + h, z); if (k !== 1) g.add(ro);
          });
        } else {
          g.add(piece(new THREE.BoxGeometry(0.6, 0.38, 0.5, 2, 2, 2), PAL.paper, 80, 0.37, -0.12, -0.2));
          const r = roof(0.78, 0.64, 0.34, PAL.coral, 81); r.position.set(-0.12, 0.56, -0.2); g.add(r);
          g.add(piece(new THREE.BoxGeometry(0.12, 0.2, 0.04, 1, 1, 1), PAL.trunk, 82, 0.28, -0.12, 0.06));
          // a dog
          const dog = new THREE.Group(); dog.add(piece(new THREE.BoxGeometry(0.34, 0.17, 0.17, 2, 1, 1), PAL.ochre, 83, 0.17));
          dog.add(piece(new THREE.IcosahedronGeometry(0.1, 0), PAL.ochre, 84, 0.26, 0.2, 0));
          dog.add(piece(new THREE.BoxGeometry(0.05, 0.12, 0.04, 1, 1, 1), PAL.trunk, 85, 0.3, 0.16, 0.06)); dog.add(piece(new THREE.BoxGeometry(0.16, 0.04, 0.04, 1, 1, 1), PAL.ochre, 86, 0.25, -0.22, 0));
          dog.position.set(0.3, 0.09, 0.36); dog.rotation.y = -0.5; g.add(dog); g.userData.dog = dog;
        }
        const x = PLOT_X[i];
        g.position.set(x, height(x, PLOT_Z) - 0.08, PLOT_Z); scene.add(g);
        const tag = flag(null, GAMES[i][0], { height: 2.8, side: 1, scale: 0.85 }); const tx = x - 0.9, tz = -1.1; tag.group.position.set(tx, height(tx, tz) - 0.02, tz); scene.add(tag.group);
        return { g, tag, t0: T.games[i] };
      });

      // ------------------------------------------------------------ stop 3: the AI tutor answers a question with a pizza
      function bubble(w, h, color, tail) {
        const g = new THREE.Group(), r = Math.min(h * 0.3, 0.3);
        const panel = new THREE.Mesh(K.roundedRect(w, h, r), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.32, roughness: 0.95 }));
        const s = new THREE.Shape(); s.moveTo(-0.24, 0); s.lineTo(0.24, 0); s.lineTo(0.1 * Math.sign(tail), -0.55); s.closePath();
        const tl = new THREE.Mesh(new THREE.ShapeGeometry(s), panel.material); tl.position.set(tail, -h / 2 + 0.02, 0);
        panel.castShadow = true; g.add(panel, tl); g.userData.panel = panel; return g;
      }
      const qText = TX(QUESTION, 0.4, PAL.paper), [qw] = qText.userData.size;
      const qBub = bubble(qw + 0.7, 0.86, PAL.coral, 1.0); qText.position.z = 0.012; qBub.add(qText);
      const aBub = bubble(3.2, 1.9, PAL.paper, -0.5);
      const frac = TX('3/8', 1.05, PAL.accent), pizzaG = new THREE.Group(); frac.position.set(0.98, 0, 0.02); aBub.add(frac);
      const slices = Array.from({ length: 8 }, (_, i) => {
        const a0 = (i / 8) * Math.PI * 2, g = new THREE.CylinderGeometry(0.64, 0.64, 0.12, 1, 1, false, a0, Math.PI * 2 / 8);
        const m = mesh(solid(g, (c, n, k) => (n.y > 0.5 ? tone(PAL.ochre, k + i * 5, 0.8) : tone('#c98a4a', k + i * 3, 0.6)), 90 + i, 0.004), faceted({ roughness: 0.85 }));
        const mid = a0 + Math.PI / 8, grp = new THREE.Group(); grp.add(m);
        if (i % 2 === 0) { const pep = mesh(solid(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 6, 1), PAL.accent, 100 + i, 0.004), faceted({ roughness: 0.8 })); pep.position.set(Math.sin(mid) * 0.36, 0.07, Math.cos(mid) * 0.36); grp.add(pep); }
        grp.userData.dir = [Math.sin(mid), Math.cos(mid)]; pizzaG.add(grp); return grp;
      });
      pizzaG.rotation.x = Math.PI / 2; pizzaG.position.set(-0.92, 0, 0.12); aBub.add(pizzaG);
      scene.add(qBub, aBub);

      // ------------------------------------------------------------ stop 4: a team gets an assignment and ticks it off
      const TEAM_C = [6.4, 0.5], TEAM_POS = [[5.3, 0.9], [7.5, 0.9], [5.8, -0.5]], TEACHER_POS = [7.7, -0.5];
      const scroll = (() => {
        const g = new THREE.Group(), W = 2.5, H = 1.75;
        const paper = new THREE.Mesh(K.roundedRect(W, H, 0.06), new THREE.MeshStandardMaterial({ color: PAL.paper, emissive: PAL.paper, emissiveIntensity: 0.32, roughness: 0.95, side: THREE.DoubleSide })); paper.castShadow = true; paper.position.y = -H / 2; g.add(paper);
        const rollGeo = solid(new THREE.CylinderGeometry(0.1, 0.1, W + 0.24, 7, 1), PAL.sand, 110, 0.008); rollGeo.rotateZ(Math.PI / 2);
        const top = mesh(rollGeo, faceted({ roughness: 0.9 })), bottom = mesh(rollGeo.clone(), faceted({ roughness: 0.9 })); g.add(top, bottom);
        const title = TX('ZADÁNÍ', 0.42, PAL.ink); title.position.set(0, -0.36, 0.012); g.add(title);
        const rows = [PAL.teal, PAL.ochre, PAL.lilac, PAL.coral].map((c, i) => {
          const y = -0.72 - i * 0.24, bar = mesh(box(1.4, 0.07, 0.02, PAL.stone, 120 + i, 0.002), faceted()), cb = mesh(box(0.17, 0.17, 0.02, c, 130 + i, 0.002), faceted());
          bar.position.set(0.28, y, 0.01); cb.position.set(-0.85, y, 0.012); g.add(bar, cb);
          const tick = new THREE.Group(); const t1 = mesh(box(0.07, 0.17, 0.03, PAL.ink, 140 + i, 0.001), faceted()), t2 = mesh(box(0.07, 0.3, 0.03, PAL.ink, 150 + i, 0.001), faceted());
          t1.position.set(-0.04, -0.03, 0); t1.rotation.z = 0.78; t2.position.set(0.05, 0.02, 0); t2.rotation.z = -0.62; tick.add(t1, t2); tick.position.set(-0.85, y + 0.02, 0.04); g.add(tick);
          return { tick, bar };
        });
        g.position.set(TEAM_C[0], 3.95, 0.2); scene.add(g);
        return { g, bottom, paper, rows, W, H };
      })();

      // ------------------------------------------------------------ stop 5: four paper flags up the mountain, and the climb
      const CLIMB = [0.3, 0.52, 0.74, 0.96].map((k) => K.lerp(U.base, 1, k));
      const levelFlags = LEVELS.map((word, i) => {
        const p = onRoute(CLIMB[i]), f = flag(null, word, { height: 1.7, side: -1, scale: 1.1 });
        f.group.position.set(p.x - 0.5, p.y - 0.02, p.z + 0.15); scene.add(f.group); return f;
      });
      const stones = Array.from({ length: 44 }, (_, i) => {
        const u = K.lerp(0.02, 0.985, i / 43), p = onRoute(u), r = K.hash(i, 2);
        const m = mesh(solid(lift(new THREE.CylinderGeometry(0.2 + r * 0.05, 0.23 + r * 0.05, 0.07, 6, 1), 0.035), (c, n, k) => tone(n.y > 0.5 ? PAL.stone : PAL.rock, k + i * 3, 0.9), 160 + i, 0.012), faceted({ roughness: 0.9 }));
        m.position.set(p.x, p.y + 0.01, p.z); m.rotation.y = r * 6; m.userData.s = 1.5; scene.add(m); return { m, u };
      });
      const gem = mesh(solid(new THREE.OctahedronGeometry(0.28, 0), PAL.coral, 170, 0.0, 0.5), new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.4, emissive: '#e9684a', emissiveIntensity: 0.35 })); scene.add(gem);
      const NC = 70, confetti = new THREE.InstancedMesh(gemGeo(0.08, 0.13), new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.5 }), NC);
      confetti.frustumCulled = false; confetti.castShadow = false; scene.add(confetti);
      const CONF_COL = [PAL.coral, PAL.ochre, PAL.teal, PAL.paper, PAL.lilac, PAL.shallow].map((c) => new THREE.Color(c));
      for (let i = 0; i < NC; i++) confetti.setColorAt(i, CONF_COL[i % CONF_COL.length]);

      // ------------------------------------------------------------ the pupil's journey along the route, in one track
      const pupilU = K.track([[0, U.s1], [T.walk1[0], U.s1], [T.walk1[1], U.s2], [T.walk2[0], U.s2], [T.walk2[1], U.s3], [T.walk3[0], U.s3], [T.walk3[1], U.s4], [T.climb[0], U.s4], [T.climb[1], 1, 'inOut']]);
      const tableT = (u) => { for (let t = 0; t <= T.end; t += 0.01) if (pupilU(t) >= u) return t; return T.end; };
      stones.forEach((s) => { s.t0 = Math.max(-0.2, tableT(s.u) - 0.65); });
      levelFlags.forEach((f, i) => { f.t0 = tableT(CLIMB[i]) - 0.35; });

      // ------------------------------------------------------------ camera: one crane move that flows through the five stops and out to the whole island
      const cam = {
        pos: K.path([[0, [-8.0, 4.4, 10.2]], [1.8, [-7.6, 4.4, 10.2]], [3.5, [-1.6, 4.5, 10.4]], [4.8, [-1.6, 4.5, 10.4]], [5.6, [2.8, 4.7, 10.4]], [7.2, [2.8, 4.7, 10.4]], [7.9, [6.4, 4.9, 10.4]], [9.8, [6.4, 4.9, 10.4]], [11.0, [8.0, 6.0, 13.6]], [12.5, [8.6, 6.6, 14.6]]]),
        aim: K.path([[0, [-7.9, 1.6, 0.6]], [1.8, [-7.5, 1.6, 0.6]], [3.5, [-1.2, 1.5, 0.4]], [4.8, [-1.2, 1.5, 0.4]], [5.6, [2.9, 2.5, 0.4]], [7.2, [2.9, 2.5, 0.4]], [7.9, [6.5, 2.7, 0.0]], [9.8, [6.5, 2.7, 0.0]], [11.0, [10.0, 3.4, -2.6]], [12.5, [10.4, 3.7, -3.2]]]),
        focus: K.track([[0, [-7.5, 1.0, 0.6]], [1.8, [-7.5, 1.0, 0.6]], [3.5, [-1.2, 1.0, 0.4], 'inOut'], [4.8, [-1.2, 1.0, 0.4]], [5.6, [2.9, 1.4, 1.0], 'inOut'], [7.2, [2.9, 1.4, 1.0]], [7.9, [6.4, 1.2, 0.4], 'inOut'], [9.8, [6.4, 1.2, 0.4]], [11.0, [10.0, 3.0, -2.5], 'inOut'], [12.5, [10.4, 3.4, -3.0]]]),
        ap: K.track([[0, 0.06], [9.8, 0.06], [12.5, 0.05, 'inOut']]),
      };
      const pop = (g, t, t0, f = 2.6, d = 0.4, base = 1) => { const a = K.spring(t - t0, f, d), w = K.spring(t - t0 - 0.05, f * 0.85, Math.min(0.9, d + 0.1)); g.visible = t > t0 - 1e-3; g.scale.set(Math.max(0.001, w) * base, Math.max(0.001, a) * base, Math.max(0.001, w) * base); };
      const place2 = (g, x, z, yaw, dy = 0) => { g.position.set(x, height(x, z) + dy, z); g.rotation.y = yaw; };
      let prevPhase = 0;

      return {
        update(t) {
          clock.value = t;
          // far clouds drift
          (S._clouds || []).forEach((c, i) => c.position.set(c.userData.base[0] + 0.12 * t * (1 + i * 0.1), c.userData.base[1] + 0.05 * Math.sin(t * 0.9 + i * 2.1), c.userData.base[2]));
          // the pupil
          const u = pupilU(t), pp = onRoute(u), u2 = pupilU(t + 0.04), u1 = pupilU(t - 0.04), speed = Math.abs(u2 - u1) / 0.08 * ROUTE_LEN, walk = K.smooth(0.05, 0.9, speed);
          const dist = u * ROUTE_LEN, phase = dist * 6.2;
          const climbing = t > T.climb[0] - 0.2, faceCam = 0.25;
          let yaw = Math.atan2(pp.tx, pp.tz); yaw = K.lerp(faceCam, yaw, walk);
          const atS3 = t > T.q - 0.2 && t < T.walk3[0], atS2 = t > T.walk1[1] && t < T.walk2[0] + 0.3, atS4 = t > T.walk3[1] && t < T.climb[0], atS1 = t < T.walk1[0] + 0.1;
          const summit = K.seg(t, T.summit, T.summit + 0.35), hop = summit > 0 ? Math.abs(Math.sin((t - T.summit) * 7)) * 0.2 * (1 - K.smooth(T.summit + 0.8, T.end, t)) : 0;
          const waveP = (atS2 ? 1 : 0) * K.smooth(T.games[2] + 0.2, T.games[2] + 0.5, t) * (1 - K.smooth(T.walk2[0] - 0.2, T.walk2[0], t));
          pupil.group.position.set(pp.x, pp.y, pp.z); pupil.group.rotation.y = K.lerp(yaw, 0.1, summit);
          pose(pupil, { phase, walk: summit > 0 ? 0 : walk, up: summit > 0 ? 1 : (atS4 && t > T.ticks[3] ? 0.8 : 0), wave: waveP, hop });
          pupil.head.rotation.x = atS3 ? -0.15 : 0;
          // subject blocks and the signpost
          cubes.forEach((c) => { pop(c.g, t, c.t0); });
          sign.visible = true;
          // games
          plots.forEach((p, i) => { pop(p.g, t, p.t0, 2.4, 0.38, 1.35); p.tag.pop(t, p.t0 + 0.12); if (p.g.userData.dog) { const d = p.g.userData.dog; d.position.y = 0.09 + Math.abs(Math.sin(t * 6)) * 0.03; d.rotation.y = -0.5 + Math.sin(t * 1.4) * 0.3; } });
          // the AI tutor, its question bubble, its answer and the pizza
          place2(robot.group, 4.2, 0.9, -0.35, 0); pop(robot.group, t, T.robot, 2.4, 0.4, 1.4);
          robot.head.rotation.y = Math.sin(t * 1.3) * 0.18; robot.head.rotation.z = Math.sin(t * 1.7) * 0.05;
          robot.armR.rotation.set(0, 0, -0.25 - 0.5 * K.smooth(T.a - 0.1, T.a + 0.2, t) * (1 - K.smooth(T.a + 0.9, T.a + 1.4, t)) - 0.1 * Math.sin(t * 3));
          robot.armL.rotation.z = 0.2; robot.ball.scale.setScalar(1 + 0.15 * Math.sin(t * 5));
          const bye = (a) => 1 - K.seg(t, a, a + 0.35, K.ease.in), qa = K.spring(t - T.q, 2.6, 0.42) * bye(T.walk3[0] - 0.05), aa = K.spring(t - T.a, 2.6, 0.42) * bye(T.walk3[0] + 0.1);
          qBub.visible = t > T.q && qa > 0.002; qBub.position.set(1.2, 2.3 + 0.04 * Math.sin(t * 2), 2.4); qBub.scale.setScalar(Math.max(0.001, qa)); qBub.rotation.y = 0.0;
          aBub.visible = t > T.a && aa > 0.002; aBub.position.set(4.6, 3.05 + 0.04 * Math.sin(t * 2 + 1), 1.0); aBub.scale.setScalar(Math.max(0.001, aa));
          slices.forEach((g, i) => { const k = i < 3 ? K.spring(t - T.slices[i], 3.0, 0.45) : 0; g.position.set(g.userData.dir[0] * 0.2 * k, 0.02 * k, g.userData.dir[1] * 0.2 * k); });
          frac.visible = t > T.slices[2] - 0.05; frac.scale.setScalar(Math.max(0.001, K.spring(t - T.slices[2] - 0.05, 3.0, 0.4)));
          // the team
          TEAM_POS.forEach(([x, z], i) => { const m = mates[i], face = Math.atan2(TEAM_C[0] - x, 2.4 - z) * 0.4; place2(m.group, x, z, face); pop(m.group, t, T.team + i * 0.07, 2.4, 0.4, 1.5); pose(m, { phase: t * 7 + i, walk: 0, up: K.smooth(T.ticks[i] - 0.05, T.ticks[i] + 0.15, t) * (1 - K.smooth(T.ticks[i] + 0.5, T.ticks[i] + 0.8, t)) * 0.9, hop: Math.abs(Math.sin((t - T.ticks[i]) * 9)) * 0.14 * (t > T.ticks[i] && t < T.ticks[i] + 0.5 ? 1 : 0) }); });
          place2(teacher.group, TEACHER_POS[0], TEACHER_POS[1], -0.5); pop(teacher.group, t, T.team + 0.2, 2.4, 0.4, 1.9);
          pose(teacher, { phase: t * 2, walk: 0, wave: 0 }); teacher.armR.rotation.set(-1.0 - 0.25 * K.smooth(T.ticks[3] - 0.1, T.ticks[3] + 0.2, t), 0, -0.3);
          const sc = K.seg(t, T.scroll, T.scroll + 0.55, K.ease.outBack);
          const scrollOut = 1 - K.seg(t, T.climb[0] - 0.3, T.climb[0] + 0.1, K.ease.in);
          scroll.g.visible = t > T.scroll && scrollOut > 0.002; scroll.g.scale.setScalar(Math.max(0.001, K.spring(t - T.scroll, 2.6, 0.45) * scrollOut));
          scroll.g.position.y = 3.9 + 0.04 * Math.sin(t * 2.2);
          const unroll = K.seg(t, T.scroll + 0.1, T.scroll + 0.6, K.ease.out);
          scroll.paper.scale.y = Math.max(0.02, unroll); scroll.paper.position.y = -scroll.H * Math.max(0.02, unroll) / 2; scroll.bottom.position.y = -scroll.H * Math.max(0.02, unroll);
          scroll.rows.forEach((r, i) => { r.tick.scale.setScalar(Math.max(0.001, K.spring(t - T.ticks[i], 3.2, 0.4))); r.tick.visible = t > T.ticks[i]; });
          // stones and flags up the mountain
          stones.forEach((s) => { const k = K.spring(t - s.t0, 3.2, 0.45); s.m.visible = t > s.t0; const q = Math.max(0.001, k) * 1.5; s.m.scale.set(q, q, q); });
          levelFlags.forEach((f) => f.pop(t, f.t0));
          // the summit: a gem appears above the pupil and a burst of paper confetti
          const gk = K.spring(t - T.summit, 2.6, 0.4); gem.visible = t > T.summit; gem.scale.setScalar(Math.max(0.001, gk));
          gem.position.set(pp.x, pp.y + 2.0 + 0.08 * Math.sin(t * 3), pp.z); gem.rotation.y = t * 1.6;
          for (let i = 0; i < NC; i++) {
            const tt = t - T.confetti - K.hash(i, 1) * 0.15, a = K.hash(i, 2) * 6.283, v = 1.2 + K.hash(i, 3) * 2.2, up = 3.2 + K.hash(i, 4) * 2.6;
            const on = tt > 0 && tt < 3.0, x = pp.x + Math.cos(a) * v * tt * 0.7, z = pp.z + Math.sin(a) * v * tt * 0.5, y = pp.y + 0.8 + up * tt - 4.2 * tt * tt;
            K.place(confetti, i, [x, Math.max(y, pp.y), z], [tt * 3 + i, tt * 4, tt * 2], on ? 0.8 + K.hash(i, 5) * 0.6 : 0);
          }
          confetti.instanceMatrix.needsUpdate = true;
          // flags
          flags.forEach((f, i) => f.pop(t, FLAG_T[i]));
          // the paper boat rides the sea
          const bx = -13.0 + 0.12 * t, bz = 3.4, wv = (x, z) => 0.075 * (Math.sin(x * 1.25 + t * 1.35) * Math.cos(z * 1.05 - t * 1.1) * 0.6 + Math.sin(x * 2.7 - z * 2.2 + t * 2.3) * 0.4);
          boat.position.set(bx, wv(bx, bz) + 0.03, bz); boat.rotation.set(0.08 * Math.sin(t * 1.3), 0.5, (wv(bx + 0.3, bz) - wv(bx - 0.3, bz)) * 1.2); boat.scale.setScalar(1.3);
          const p = cam.pos(t), a = cam.aim(t);
          K.look(camera, p, a); K.focus(camera, cam.focus(t), cam.ap(t));
          sky.position.copy(camera.position);
        },
      };
    },
  });
}
