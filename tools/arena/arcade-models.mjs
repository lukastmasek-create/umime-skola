// Low-poly geometry shared by the GLB exports and the arcade sprite sheets.
import * as T from "three";

const ink = "#22223b", cream = "#fff0bd", steel = "#93b6d3";
const glow = "#ecfdff", green = "#53ca8d", mint = "#a8eb8e", emerald = "#248876";
const gold = "#ffc651", coral = "#f36c6f", cobalt = "#578eec", purple = "#a07aea";

function model(name) {
  const group = new T.Group();
  group.name = name;
  return group;
}

function mesh(g, geometry, color, x = 0, y = 0, z = 0) {
  const m = new T.Mesh(geometry, new T.MeshStandardMaterial({
    color, flatShading: true, roughness: 0.85,
  }));
  m.position.set(x, y, z);
  g.add(m);
  return m;
}

function tile(g, w, h, d, color, x = 0, y = 0, z = 0, bevel = 0.07) {
  const b = Math.min(w, h, d) * bevel;
  const shape = new T.Shape();
  shape.moveTo(-w / 2 + b, -h / 2 + b);
  shape.lineTo(w / 2 - b, -h / 2 + b);
  shape.lineTo(w / 2 - b, h / 2 - b);
  shape.lineTo(-w / 2 + b, h / 2 - b);
  shape.closePath();
  const geometry = new T.ExtrudeGeometry(shape, { depth: d - 2 * b, steps: 1, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 1 });
  geometry.translate(0, 0, -d / 2 + b);
  return mesh(g, geometry, color, x, y, z);
}

function poly(g, points, d, color, z = 0) {
  const shape = new T.Shape(points.map(([x, y]) => new T.Vector2(x, y)));
  const geometry = new T.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false });
  geometry.translate(0, 0, -d / 2);
  return mesh(g, geometry, color, 0, 0, z);
}

function facet(g, color, x, y, z, w, h, d, detail = 0) {
  const m = mesh(g, new T.IcosahedronGeometry(1, detail), color, x, y, z);
  m.scale.set(w, h, d);
  return m;
}

function cylinder(g, color, x, y, z, top, bottom, h, segments = 8) {
  return mesh(g, new T.CylinderGeometry(top, bottom, h, segments), color, x, y, z);
}

function disc(g, color, x, y, z, radius, depth, segments = 8) {
  const m = cylinder(g, color, x, y, z, radius, radius, depth, segments);
  m.rotation.x = Math.PI / 2;
  return m;
}

const appleColors = { cervene: coral, fialove: purple, zelene: "#82cc51", zlute: gold };
const brickColors = { cervena: coral, fialova: purple, zelena: green, zluta: gold };
const blockColors = { i: "#5ad9e5", j: cobalt, l: "#ff9b51", o: gold, s: green, t: purple, z: coral, smeti: "#9c9ebb" };
const ghostColors = { cerveny: "#f37794", modry: "#6acbe9", oranzovy: "#ffa866", ruzovy: "#eab3e5", vystraseny: "#7275dc" };

function fruit(name, color, sliced = false) {
  const g = model(name);
  if (sliced) {
    const flesh = { meloun: "#ff7d9a", jablko: cream, pomeranc: "#ffc06d", ananas: "#ffe88b", kiwi: "#b9df69" }[name];
    disc(g, color, 0, 0, 0, 0.72, 0.37, 10);
    disc(g, flesh, 0, 0, 0.2, 0.59, 0.04, 10);
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      facet(g, name === "pomeranc" ? cream : "#543248", Math.cos(a) * .32, Math.sin(a) * .32, .23, .042, .067, .018);
    }
    return g;
  }
  if (name === "ananas") {
    cylinder(g, color, 0, -.08, 0, .43, .53, .98);
    for (let i = 0; i < 8; i++) {
      const a = 2 * Math.PI * i / 8;
      for (const y of [-.35, -.04, .26]) {
        facet(g, i % 2 ? "#ffe08b" : "#eb9250", Math.sin(a) * .46, y, Math.cos(a) * .46, .13, .125, .13);
      }
    }
    for (const angle of [-.58, -.25, .25, .58]) {
      facet(g, angle > 0 ? green : emerald, -angle / 2, .56, 0, .13, .43, .12).rotation.z = angle;
    }
    return g;
  }
  facet(g, color, 0, -.03, 0, .65, name === "kiwi" ? .83 : .65, .61, 1);
  if (name === "meloun") {
    for (const angle of [-.62, .15, .68]) {
      const stripe = mesh(g, new T.SphereGeometry(1, 3, 8, angle, .12), "#397258");
      stripe.scale.set(.65, .65, .62);
      stripe.position.y = -.03;
    }
  } else if (name !== "kiwi") {
    tile(g, .095, .25, .09, "#794044", 0, .61, 0).rotation.z = -.2;
    facet(g, mint, .17, .68, 0, .23, .10, .12).rotation.z = .42;
  }
  return g;
}

function space(name, frame = "") {
  const g = model(name);
  if (name === "lod") {
    poly(g, [[-.76,-.58],[-.68,-.05],[-.35,.03],[0,.83],[.35,.03],[.68,-.05],[.76,-.58],[.3,-.42],[-.3,-.42]], .21, frame === "zasah" ? coral : steel);
    poly(g, [[-.36,-.37],[-.26,.23],[0,.8],[.26,.23],[.36,-.37],[0,-.54]], .28, "#ebe8ff", .05);
    facet(g, "#5077ef", 0, .11, .23, .22, .34, .12);
    for (const side of [-1, 1]) {
      tile(g, .14, .38, .21, cobalt, side * .57, -.28, .12);
      facet(g, "#6df2da", side * .57, -.51, .11, .08, frame.startsWith("plamen") ? .14 + Number(frame.at(-1)) * .043 : .08, .07);
    }
    if (frame === "vlevo" || frame === "vpravo") g.rotation.y = frame === "vlevo" ? -.5 : .5;
  } else if (name.startsWith("bonus_")) {
    const key = name.slice(6);
    const tint = { stit: "#4bd6c0", rychla_strelba: gold, zpomaleni: purple }[key];
    disc(g, tint, 0, 0, 0, .64, .28, 6);
    disc(g, ink, 0, 0, .16, .49, .08, 6);
    const marks = {
      stit: [[-.27,.22],[0,.32],[.27,.22],[.25,-.04],[0,-.31],[-.25,-.04]],
      rychla_strelba: [[-.12,.34],[.15,.34],[.01,.06],[.21,.06],[-.17,-.35],[-.04,-.06],[-.22,-.06]],
      zpomaleni: [[-.22,.28],[.22,.28],[.07,.04],[.07,-.04],[.22,-.28],[-.22,-.28],[-.07,-.04],[-.07,.04]],
    };
    poly(g, marks[key], .06, glow, .23);
  } else {
    const type = name.replace("mimozemstan_", "");
    const color = frame.includes("zasah") ? "#ffc9be" : { krab: coral, kyklop: purple, chobotnice: green, ufo: cobalt }[type];
    if (type === "ufo") {
      facet(g, steel, 0, -.19, 0, .82, .26, .32, 1);
      facet(g, color, 0, .12, 0, .43, .44, .37, 1);
      for (const x of [-.49, 0, .49]) disc(g, gold, x, -.17, .3, .07, .05);
    } else {
      facet(g, color, 0, .03, 0, type === "krab" ? .6 : .52, .48, .34, 1);
      for (const side of [-1, 1]) {
        const step = Math.sin((Number(frame.at(-1)) || 0) * Math.PI / 2) * .13;
        if (type === "krab") {
          tile(g, .34, .12, .18, color, side * .56, -.17, .02).rotation.z = side * -.3;
          for (const index of [-1, 1]) facet(g, "#ffab73", side * .72, index * .14 - .05 + step, .13, .21, .13, .12).rotation.z = side * index * .45;
        } else {
          for (const x of type === "chobotnice" ? [.18,.39,.56] : [.3]) {
            tile(g, .15, .33, .19, color, side * x, -.38 + step * side, .03).rotation.z = side * x;
          }
        }
      }
      for (const x of type === "kyklop" ? [0] : [-.2,.2]) {
        disc(g, ink, x, .12, .33, type === "kyklop" ? .22 : .12, .08);
        disc(g, frame.includes("nabijeni") ? gold : glow, x + .018, .13, .39, type === "kyklop" ? .12 : .064, .06);
      }
    }
  }
  return g;
}

function pacman(name, frame = "") {
  const g = model(name);
  if (name === "pac") {
    const angle = { zavrena: .07, pootevrena: .37, otevrena: .66 }[frame] ?? .53;
    const points = [[0,0]];
    for (let i = 0; i <= 13; i++) {
      const a = angle + i * (2 * Math.PI - 2 * angle) / 13;
      points.push([Math.cos(a) * .63, Math.sin(a) * .63]);
    }
    poly(g, points, .42, gold);
    facet(g, "#ffe598", -.24, .3, .23, .23, .10, .025).rotation.z = .65;
    disc(g, ink, .09, .31, .23, .07, .03);
    return g;
  }
  if (frame !== "jen_oci") {
    const tint = frame === "vystraseny_blik" ? "#f8e5ef" : ghostColors[name.slice(5)];
    const bob = frame.endsWith("2") ? -.08 : .02;
    poly(g, [[-.61,-.62],[-.61,.19],[-.43,.47],[-.22,.63],[.22,.63],[.48,.45],[.61,.18],[.61,-.62],[.41,-.39+bob],[.20,-.61],[0,-.42-bob],[-.20,-.61],[-.41,-.39+bob]], .48, tint);
    facet(g, frame === "vystraseny_blik" ? cobalt : tint, -.35, .31, .245, .15, .12, .022);
  }
  for (const x of [-.22,.22]) {
    disc(g, cream, x, .12, .26, .172, .12);
    disc(g, ink, x + .04, .079, .34, .075, .04);
  }
  return g;
}

function snake(name) {
  if (name.startsWith("jablko_")) return fruit("jablko", appleColors[name.slice(7)]);
  const g = model(name);
  if (name === "hlava") {
    facet(g, mint, -.1, 0, 0, .65, .60, .38, 1);
    tile(g, .5, .65, .38, green, .36, 0);
    for (const y of [-.3,.3]) {
      disc(g, cream, -.03, y, .36, .155, .075);
      disc(g, ink, .02, y, .42, .077, .04);
    }
    tile(g, .29, .045, .043, coral, .7, 0, .13);
  } else if (name === "zatacka") {
    poly(g, [[-.72,-.29],[.2,-.29],[.35,-.17],[.35,.72],[-.22,.72],[-.22,.34],[-.37,.28],[-.72,.28]], .35, green);
    facet(g, mint, .03, .06, .19, .22, .21, .08);
    g.rotation.z = Math.PI;
  } else if (name === "ocas") {
    poly(g, [[-.7,0],[-.26,-.24],[.72,-.32],[.72,.32],[-.26,.24]], .32, emerald);
    facet(g, green, .22, 0, .16, .29, .17, .065);
  } else {
    tile(g, 1.44, .62, .36, green, 0, 0, 0, .23);
    for (const x of [-.43,0,.43]) facet(g, mint, x, 0, .17, .25, .23, .08);
  }
  return g;
}

function block(game, name) {
  const g = model(name);
  if (name === "micek") {
    facet(g, "#d7efff", 0, 0, 0, .66, .66, .66, 1);
    return g;
  }
  if (name === "palka") {
    tile(g, 2.85, .36, .33, cobalt);
    tile(g, 2.06, .14, .09, glow, 0, .03, .19);
    for (const x of [-1.33,1.33]) tile(g, .31, .42, .39, "#efab70", x, 0);
    return g;
  }
  const gems = [cobalt, coral, green, gold];
  if (name.startsWith("drahokam_")) {
    const tint = gems[Number(name.at(-1)) - 1];
    tile(g, .96, .96, .27, ink, 0, 0, 0, .3);
    facet(g, tint, 0, 0, .2, .48, .56, .31).rotation.z = Math.PI / 4;
    return g;
  }
  const brick = game === "breakout";
  const tint = brick ? brickColors[name.slice(6)] : blockColors[name.slice(7)];
  const w = brick ? 1.8 : 1, h = brick ? .72 : 1;
  tile(g, w, h, .35, tint, 0, 0, 0, .25);
  tile(g, w * .74, h * .65, .095, tint, 0, -.015, .204);
  for (const x of [-1,1]) tile(g, w * .12, h * .095, .038, cream, x * w * .31, h * .29, .243);
  return g;
}

function arcadeProp(game, name, frame = "") {
  const g = model(name);
  if (name === "cepel" || name === "kladivo") {
    tile(g, .19, .89, .22, "#825571", 0, -.36);
    if (name === "cepel") {
      poly(g, [[-.18,0],[-.03,.8],[.26,1.3],[.22,.53],[.06,0]], .15, steel);
      poly(g, [[.03,.08],[.11,.78],[.26,1.3],[.22,.53],[.06,0]], .05, glow, .08);
      tile(g, .48, .125, .25, gold);
    } else {
      tile(g, 1.08, .49, .48, "#a0768e", 0, .28, 0);
      for (const x of [-.5,.5]) tile(g, .22, .57, .54, gold, x, .28, 0);
      tile(g, .15, .42, .08, cream, 0, -.42, .115);
    }
  } else if (name === "krtek" || name === "gorila") {
    const mole = name === "krtek";
    const fur = mole ? "#926d91" : "#596079";
    facet(g, fur, 0, -.27, 0, .63, .68, .4, 1);
    facet(g, "#b5929e", 0, -.32, .31, .43, .40, .16, 1);
    facet(g, fur, 0, .36, .02, .59, .52, .42, 1);
    for (const side of [-1,1]) {
      facet(g, fur, side * .45, .64, 0, .24, .21, .14);
      facet(g, "#d9a49c", side * .43, .64, .11, .12, .12, .07);
      facet(g, frame === "zasah" ? gold : ink, side * .207, .43, .39, .077, .085, .067);
      const wave = frame.startsWith("vitez") ? .16 * Number(frame.at(-1)) : 0;
      facet(g, fur, side * .64, -.23 + wave, .12, mole ? .22 : .39, .31, .17);
      facet(g, "#e5b0a4", side * .65, -.37 + wave, .25, .19, .135, .09);
    }
    facet(g, "#d9a49c", 0, .23, .39, .27, .16, .145, 1);
    facet(g, "#4e2e49", 0, .29, .51, .14, .09, .064);
  } else if (name === "hrac") {
    tile(g, .62, .69, .36, cobalt, 0, -.24);
    tile(g, .55, .5, .44, "#eeb195", 0, .31);
    tile(g, .72, .16, .52, coral, 0, .59);
    for (const side of [-1,1]) {
      tile(g, .25, .33, .30, steel, side * .18, -.69);
      tile(g, .18, .36, .25, cream, side * .43, -.19);
      disc(g, ink, side * .12, .34, .23, .044, .035);
    }
  } else if (name === "sud") {
    cylinder(g, "#a86c52", 0, 0, 0, .47, .47, .83, 10);
    for (const y of [-.3,.3]) cylinder(g, gold, 0, y, 0, .5, .5, .12, 10);
  } else if (name === "nosnik") {
    for (const y of [-.24,.24]) tile(g, 2.05, .165, .24, coral, 0, y);
    for (const x of [-.75,-.25,.25,.75]) tile(g, .135, .53, .19, "#a04665", x, 0).rotation.z = -.55;
  } else if (name === "zebrik") {
    for (const x of [-.31,.31]) tile(g, .135, 1.72, .19, steel, x, 0);
    for (const y of [-.56,-.28,0,.28,.56]) tile(g, .64, .105, .15, gold, 0, y);
  } else {
    throw new Error(`Unknown arcade model: ${game}/${name}`);
  }
  return g;
}

export function makeModel(game, name, frame = "") {
  if (game === "space") return space(name, frame);
  if (game === "pacman") return pacman(name, frame);
  if (game === "snake") return snake(name);
  if (game === "breakout" || game === "tetris") return block(game, name);
  if (game === "ninja" && name !== "cepel") {
    return fruit(name, { jablko: coral, meloun: green, ananas: gold, kiwi: "#b08b62", pomeranc: "#fca04d" }[name], frame === "pulky");
  }
  return arcadeProp(game, name, frame);
}
