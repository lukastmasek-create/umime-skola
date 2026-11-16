import React, {useId, type ReactNode} from "react";

export const STUDIO = {
  highlight: "#3B414B",
  wall: "#22262E",
  floor: "#2B3039",
  ink: "#191D2E",
  faceTop: "#292541",
  faceBottom: "#17152D",
  edge: "#8179A8",
  cream: "#F6F1E4",
  yellow: "#FFC933",
  green: "#168451",
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const mix = (from: number, to: number, t: number) => from + (to - from) * t;
export const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeInOutQuintic = (t: number) => t ** 3 * (10 + t * (-15 + 6 * t));

export function beat(frame: number, start: number, duration: number) {
  return clamp((frame - start) / Math.max(Number.EPSILON, duration));
}

function svgId(prefix: string, id: string) {
  return prefix + Array.from(id, (char) => char.codePointAt(0)!.toString(16)).join("-");
}

export function StudioBackdrop({
  tone = "neutral",
}: {
  frame: number;
  tone?: "neutral" | "warm" | "cool";
}) {
  const id = svgId("studio-", useId());
  const [light, wall, floor] = tone === "warm"
    ? ["#433C37", "#292522", "#342D29"]
    : tone === "cool"
      ? ["#384451", "#1C2631", "#273442"]
      : [STUDIO.highlight, STUDIO.wall, STUDIO.floor];
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={id + "-floor"} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0" stopColor={wall} />
          <stop offset=".49" stopColor={wall} />
          <stop offset="1" stopColor={floor} />
        </linearGradient>
        <radialGradient id={id + "-light"} cx=".38" cy=".29" r=".72">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={light} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1920" height="1080" fill={`url(#${id}-floor)`} />
      <rect x="-32" y="-16" width="1984" height="1112" fill={`url(#${id}-light)`} />
    </g>
  );
}

export function shadowParameters(lift: number, depth: number) {
  const t = clamp(lift);
  const weight = mix(.58, 1, clamp(depth));
  return {
    castX: mix(9, 32, t),
    castY: mix(12, 49, t),
    spread: mix(6, 24, t),
    contactAlpha: mix(.78, .12, t) * weight,
    castAlpha: mix(.65, .40, t) * weight,
    ambientAlpha: mix(.34, .26, t) * weight,
    castBlur: mix(5, 15, t),
    ambientBlur: mix(12, 27, t),
  };
}

function CardShadow({id, width, height, thickness, radius, lift, depth}: {
  id: string; width: number; height: number; thickness: number;
  radius: number; lift: number; depth: number;
}) {
  const p = shadowParameters(lift, depth);
  const edge = height + thickness;
  const color = "#080A10";
  const filterBounds = {x: -150, y: -110, width: width + 340, height: height + 340};
  return (
    <g aria-hidden="true" pointerEvents="none">
      <defs>
        <radialGradient id={id + "-ambient"} cx=".43" cy=".38" r=".63">
          <stop offset="0" stopColor={color} stopOpacity={p.ambientAlpha} />
          <stop offset=".54" stopColor={color} stopOpacity={p.ambientAlpha * .64} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id + "-cast"} gradientUnits="userSpaceOnUse"
          x1={width * .30} y1={edge - 8} x2={width * .66} y2={edge + p.castY + p.spread}>
          <stop offset="0" stopColor={color} stopOpacity={p.castAlpha} />
          <stop offset=".25" stopColor={color} stopOpacity={p.castAlpha * .82} />
          <stop offset=".65" stopColor={color} stopOpacity={p.castAlpha * .31} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id + "-core"} cx=".47" cy=".44" r=".53">
          <stop offset="0" stopColor={color} stopOpacity={p.contactAlpha} />
          <stop offset=".56" stopColor={color} stopOpacity={p.contactAlpha * .70} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <filter id={id + "-ambientBlur"} filterUnits="userSpaceOnUse" {...filterBounds}>
          <feGaussianBlur stdDeviation={p.ambientBlur} />
        </filter>
        <filter id={id + "-castBlur"} filterUnits="userSpaceOnUse" {...filterBounds}>
          <feGaussianBlur stdDeviation={p.castBlur} />
        </filter>
      </defs>
      <ellipse cx={width / 2 + p.castX * 1.3} cy={edge + p.castY * .70}
        rx={width * .53 + p.spread} ry={p.castY + p.spread + 8}
        fill={`url(#${id}-ambient)`} filter={`url(#${id}-ambientBlur)`} />
      <rect x={p.castX - p.spread / 2} y={p.castY + thickness}
        width={width + p.spread} height={height + p.spread * .45} rx={radius + p.spread * .4}
        fill={`url(#${id}-cast)`} filter={`url(#${id}-castBlur)`} />
      <ellipse cx={width * .51} cy={edge + 4}
        rx={width * .52} ry={mix(13, 23, clamp(lift))}
        fill={`url(#${id}-core)`} />
    </g>
  );
}

type CardProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  depth?: number;
  lift?: number;
  tone?: number; // 0 = navy, 1 = cream
  shellTransform?: string; // applied only to the outer surface and rim
  children?: ReactNode;
};

export function StudioCard({
  x, y, width, height, depth = 1, lift = 0, tone = 0, shellTransform, children,
}: CardProps) {
  const id = svgId("card-", useId());
  const z = clamp(depth);
  const elevation = clamp(lift);
  const thickness = mix(4, 10, z);

  const radius = Math.min(36, width / 2, height / 2);
  const faceTone = clamp(tone);
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <linearGradient id={id + "-face"} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop stopColor={STUDIO.faceTop} />
          <stop offset="1" stopColor={STUDIO.faceBottom} />
        </linearGradient>
        <linearGradient id={id + "-edgeLight"} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0" stopColor="white" stopOpacity={mix(.36, .65, elevation)} />
          <stop offset=".47" stopColor="white" stopOpacity=".08" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id + "-side"} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0" stopColor="#504766" />
          <stop offset=".55" stopColor="#201A36" />
          <stop offset="1" stopColor="#100E1F" />
        </linearGradient>
        <clipPath id={id + "-clip"}>
          <rect width={width} height={height} rx={radius} />
        </clipPath>
      </defs>
      <CardShadow id={id} width={width} height={height} thickness={thickness}
        radius={radius} lift={elevation} depth={z} />
      <g transform={shellTransform}>
        <rect x="3" y={thickness} width={width} height={height} rx={radius} fill={`url(#${id}-side)`} />
        <rect x="3" y={thickness} width={width} height={height} rx={radius} fill="#9C9283"
          opacity={faceTone} />
        <rect width={width} height={height} rx={radius} fill={`url(#${id}-face)`} />
        <rect width={width} height={height} rx={radius} fill={STUDIO.cream} opacity={faceTone} />
        <rect width={width} height={height} rx={radius} fill="none"
          stroke={STUDIO.edge} strokeOpacity={mix(.28, .55, z) * (1 - .38 * faceTone)} strokeWidth="2" />
        <rect x="1.5" y="1.5" width={Math.max(0, width - 3)} height={Math.max(0, height - 3)}
          rx={Math.max(0, radius - 1.5)} fill="none"
          stroke={`url(#${id}-edgeLight)`} strokeWidth="1.5" />
      </g>
      <g clipPath={`url(#${id}-clip)`}>{children}</g>
    </g>
  );
}

// Position and opacity belong on the outer group. Deformation belongs on the shell.
export function cardArrival(frame: number, start: number, duration: number, distance = 42, pivot: Point = [0, 0]) {
  const enter = {start, end: start + duration};
  const t = eased(frame, enter);
  const lift = .56 * (1 - t);
  return {
    y: distance * (1 - t),
    opacity: smooth(beat(frame, start, duration * .48)),
    lift,
    shellTransform: stretchAlong([0, -travelVelocity(frame, enter, distance)], .031, pivot),
  };
}

export function cardExit(f: number, span: Span, travel: Point, pivot: Point = [0, 0], stretch = .031) {
  const pose = elasticTravel(f, span, [0, 0], travel, pivot, stretch);
  return {
    x: pose.x,
    y: pose.y,
    lift: .44 * eased(f, span),
    opacity: 1 - smooth(beat(phase(f, span), .37, .63)),
    shellTransform: pose.stretch,
  };
}

export type CameraView = {x: number; y: number; zoom: number};

// x and y are world-space points that land at the center of the frame.
export function cameraView(
  frame: number, start: number, from: CameraView, to: CameraView, duration: number, influence = 1,
) {
  return flightPose(frame, {start, end: start + duration}, from, to, 0, 0, influence);
}

export type Point = readonly [number, number];

// The cursor tip passes through one curved approach and reaches the control ahead of the click.
export function clickMotion(
  frame: number, click: number, from: Point, target: Point, start: number, contactLead: number, pressIn: number, release: number,
) {
  const approach = easeInOutQuintic(beat(frame, start, click - contactLead - start));
  const xDistance = target[0] - from[0];
  const yDistance = target[1] - from[1];
  const length = Math.hypot(xDistance, yDistance);
  const curve = Math.min(32, length * .17) * 4 * approach * (1 - approach);
  const x = mix(from[0], target[0], approach) - (yDistance / Math.max(1, length)) * curve;
  const y = mix(from[1], target[1], approach) + (xDistance / Math.max(1, length)) * curve;
  const elapsed = frame - click;
  const press = elapsed < 0 ? 0
    : elapsed <= pressIn ? smooth(beat(elapsed, 0, pressIn))
      : 1 - smooth(beat(elapsed, pressIn, release));
  return {
    x,
    y,
    press,
    buttonScale: 1 - .035 * press,
    buttonY: 3 * press,
  };
}

// Place separately from the result text so the reading hold starts at reveal.
export function ResultMark({frame, reveal, pulseSpan, checkSpan}: {
  frame: number; reveal: number; pulseSpan: Span; checkSpan: Span;
}) {
  if (frame < reveal) return null;
  const t = phase(frame, pulseSpan);
  const check = smooth(phase(frame, checkSpan));
  return (
    <g aria-hidden="true" fill="none">
      <circle r={mix(19, 32, easeOut(t))} stroke={STUDIO.yellow}
        strokeWidth="3" opacity={.85 * (1 - t)} />
      <circle r="18" fill={STUDIO.green} />
      <path d="M -8 0 L -2 6 L 9 -6" pathLength={1}
        stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="1 1" strokeDashoffset={1 - check} opacity={check > 0 ? 1 : 0} />
    </g>
  );
}

export function resultLap(frame: number, reveal: number, duration: number) {
  const t = beat(frame, reveal, duration);
  return {offset: -t, opacity: t > 0 && t < 1 ? Math.sin(Math.PI * t) : 0};
}


export type CardRect = {x: number; y: number; width: number; height: number};

export function sharedCardPose(
  frame: number,
  start: number,
  duration: number,
  from: CardRect,
  to: CardRect,
  arc = 24,
  fromTone = 0,
  toTone = fromTone,
) {
  const progress = beat(frame, start, duration);
  const t = easeInOutQuintic(progress);
  // Bell curve with zero velocity at each end, for a clean match at the boundaries.
  const lift = 16 * t ** 2 * (1 - t) ** 2;
  const width = mix(from.width, to.width, t);
  const height = mix(from.height, to.height, t);
  const speed = travelVelocity(frame, {start, end: start + duration}, 1);
  const arcSpeed = 32 * t * (1 - t) * (1 - 2 * t) * speed;
  const outgoing = smooth(beat(progress, .17, .30));
  const incoming = smooth(beat(progress, .38, .40));
  return {
    x: mix(from.x, to.x, t),
    y: mix(from.y, to.y, t) - arc * lift,
    width,
    height,
    lift,
    tone: mix(fromTone, toTone, t),
    shellTransform: stretchAlong([
      (to.x - from.x + (to.width - from.width) / 2) * speed,
      (to.y - from.y + (to.height - from.height) / 2) * speed - arc * arcSpeed,
    ], .034, [width / 2, height / 2]),
    oldOpacity: 1 - outgoing,
    newOpacity: incoming,
    oldY: -9 * outgoing,
    newY: 12 * (1 - incoming),
  };
}

type SharedCardProps = {
  frame: number;
  start: number;
  end: number;
  from: CardRect;
  to: CardRect;
  arc?: number;
  fromTone?: number;
  toTone?: number;
  outgoing: ReactNode;
  incoming: ReactNode;
  anchor?: ReactNode;
  anchorFrom?: Point;
  anchorTo?: Point;
  depth?: number;
};

// Keep this component at one stable React position from setup through the settled result.
export function SharedStudioCard({
  frame, start, end, from, to, arc, fromTone, toTone, outgoing, incoming,
  anchor, anchorFrom = [0, 0], anchorTo = anchorFrom, depth = 1,
}: SharedCardProps) {
  const {oldOpacity, newOpacity, oldY, newY, ...pose} = sharedCardPose(
    frame, start, end - start, from, to, arc, fromTone, toTone,
  );
  const progress = eased(frame, {start, end});
  const ax = mix(anchorFrom[0], anchorTo[0], progress);
  const ay = mix(anchorFrom[1], anchorTo[1], progress);
  return (
    <StudioCard {...pose} depth={depth}>
      <g opacity={oldOpacity} transform={`translate(0 ${oldY})`} aria-hidden={oldOpacity === 0}>
        {outgoing}
      </g>
      <g opacity={newOpacity} transform={`translate(0 ${newY})`} aria-hidden={newOpacity === 0}>
        {incoming}
      </g>
      <g transform={`translate(${ax} ${ay})`}>{anchor}</g>
    </StudioCard>
  );
}

// ================= Section 11: reusable motion primitives =================

export type Span = {start: number; end: number};
export const phase = (f: number, span: Span) => beat(f, span.start, span.end - span.start);
const eased = (f: number, span: Span) => easeInOutQuintic(phase(f, span));
const offsetSpan = (span: Span, by: number): Span => ({start: span.start + by, end: span.end + by});

// Derivative of the same easing used for position, in distance per output frame.
export function travelVelocity(f: number, span: Span, distance: number) {
  const t = phase(f, span);
  return distance * 30 * t ** 2 * (1 - t) ** 2 / Math.max(Number.EPSILON, span.end - span.start);
}

// Stretch along the tangent and use reciprocal scale across it to preserve area.
export function stretchAlong(velocity: Point, maxStretch: number, pivot: Point = [0, 0]) {
  const speed = Math.hypot(...velocity);
  const gain = Math.max(0, Math.min(.08, maxStretch)) * (1 - Math.exp(-speed / 8));
  if (gain < 1e-5) return "";
  const angle = Math.atan2(velocity[1], velocity[0]) * 180 / Math.PI;
  const [cx, cy] = pivot;
  return `translate(${cx} ${cy}) rotate(${angle}) scale(${1 + gain} ${1 / (1 + gain)}) rotate(${-angle}) translate(${-cx} ${-cy})`;
}

export function elasticTravel(
  f: number, span: Span, from: Point, to: Point, pivot: Point, maxStretch: number,
) {
  const t = eased(f, span);
  return {
    x: mix(from[0], to[0], t),
    y: mix(from[1], to[1], t),
    stretch: stretchAlong([
      travelVelocity(f, span, to[0] - from[0]),
      travelVelocity(f, span, to[1] - from[1]),
    ], maxStretch, pivot),
  };
}

export function logoPose(f: number, span: Span, cx: number, cy: number) {
  const t = easeOut(phase(f, span));
  return `translate(${cx} ${cy - 5 * (1 - t)}) scale(${mix(1.025, 1, t)}) translate(${-cx} ${-cy})`;
}

export function fanPose(
  f: number, span: Span, index: number, count: number, chosen: number, gap: number, stagger: number,
) {
  const t = eased(f, offsetSpan(span, Math.abs(index - chosen) * stagger));
  const side = index - (count - 1) / 2;
  const rear = index === chosen ? 0 : 1;
  return {
    transform: `translate(${side * gap * t} ${rear * 22 * t}) rotate(${side * 3 * t}) scale(${1 - rear * .06 * t})`,
    lift: (1 - rear) * .35 * t,
  };
}

export function textPose(
  f: number, span: Span, index = 0, stagger = 0, pivot: Point = [0, 0], stretch = .052,
) {
  const enter = offsetSpan(span, index * stagger);
  const pose = elasticTravel(f, enter, [0, 21], [0, 0], pivot, stretch);
  return {
    opacity: smooth(beat(phase(f, enter), 0, .65)),
    transform: `translate(${pose.x} ${pose.y}) ${pose.stretch}`,
  };
}

export function textExitPose(
  f: number, span: Span, pivot: Point, travel: Point = [0, -18], stretch = .052,
) {
  const pose = elasticTravel(f, span, [0, 0], travel, pivot, stretch);
  return {
    opacity: 1 - smooth(beat(phase(f, span), .12, .72)),
    transform: `translate(${pose.x} ${pose.y}) ${pose.stretch}`,
  };
}

export function typeState(f: number, span: Span, input: string, locale: string, blinkPeriod: number) {
  const characters = Array.from(new Intl.Segmenter(locale, {granularity: "grapheme"}).segment(input),
    ({segment}) => segment);
  const keyFrames = characters.map((_, i) =>
    Math.ceil(mix(span.start, span.end, (i + 1) / characters.length)));
  const shown = keyFrames.filter((key) => key <= f).length;
  const caret = f >= span.start && (f < span.end ||
    (f - span.end) % Math.max(1, blinkPeriod) < blinkPeriod / 2);
  return {text: characters.slice(0, shown).join(""), caret, keyFrames};
}

export const tailOpacity = (f: number, span: Span) => 1 - smooth(phase(f, span));
export function bubblePose(f: number, span: Span) {
  const t = easeOut(phase(f, span));
  return {opacity: t, transform: `translate(0 ${10 * (1 - t)}) scale(${mix(.96, 1, t)})`};
}

export function impactPose(f: number, span: Span, strength: number, pivot: Point = [0, 0]) {
  const t = phase(f, span);
  if (t === 0 || t === 1) return "";
  const wave = Math.sin(2 * Math.PI * t) * (1 - t) ** 2 * Math.min(.07, clamp(strength));
  const scaleY = 1 - wave;
  return `translate(${pivot[0]} ${pivot[1]}) scale(${1 / scaleY} ${scaleY}) translate(${-pivot[0]} ${-pivot[1]})`;
}

export const readingIndex = (f: number, span: Span, count: number) =>
  Math.min(count - 1, Math.floor(phase(f, span) * count));
export const drawPath = (f: number, span: Span) => 1 - eased(f, span);

export function magnetPose(
  cursor: {x: number; y: number; press: number; buttonScale: number; buttonY: number},
  target: Point,
  reach = 120,
) {
  const dx = cursor.x - target[0];
  const dy = cursor.y - target[1];
  const distance = Math.hypot(dx, dy);
  const pull = smooth(clamp(1 - distance / reach)) * Math.min(1, distance / (reach / 3)) *
    (1 - cursor.press);
  return `translate(${6 * pull * dx / Math.max(1, distance)} ${cursor.buttonY + 4 * pull * dy / Math.max(1, distance)}) rotate(${2 * pull * Math.sign(dx)}) scale(${cursor.buttonScale + .025 * pull})`;
}

export function menuGap(f: number, span: Span, gap: number) {
  const x = eased(f, span) * gap / 2;
  return {left: `translate(${-x} 0)`, right: `translate(${x} 0)`};
}

export function pillPose(f: number, span: Span, from: CardRect, to: CardRect) {
  const t = eased(f, span);
  return {x: mix(from.x, to.x, t), y: mix(from.y, to.y, t),
    width: mix(from.width, to.width, t), height: mix(from.height, to.height, t)};
}

export function stackTransform(
  f: number, orbit: Span, lift: Span, index: number, chosen: number, gap: number,
) {
  const turn = eased(f, orbit);
  const flatten = index === chosen ? eased(f, lift) : 0;
  const z = (index - chosen) * gap + 62 * Math.sin(Math.PI * flatten);
  return `rotateY(${mix(-12 + 24 * turn, 0, flatten)}deg) rotateX(${48 * (1 - flatten)}deg) rotateZ(${-28 * (1 - flatten)}deg) translateZ(${z}px)`;
}

export const flipTransform = (f: number, span: Span) => `rotateY(${180 * eased(f, span)}deg)`;

export function trailSamples<T extends {x: number; y: number}>(
  f: number, span: Span, delays: readonly number[], poseAt: (frame: number) => T, threshold: number,
) {
  if (f <= span.start || f >= span.end) return [];
  const a = poseAt(f), b = poseAt(f - 1);
  const speed = Math.hypot(a.x - b.x, a.y - b.y);
  const visibility = smooth(beat(speed, threshold, Math.max(1, threshold * .55)));
  if (visibility === 0) return [];
  return delays.flatMap((delay, i) => f - delay < span.start ? [] :
    [{pose: poseAt(f - delay), opacity: .22 * visibility / (i + 1)}]);
}

export function sweepPose(f: number, span: Span, width: number, band: number) {
  const t = phase(f, span);
  return {x: mix(-band, width + band, t), opacity: .16 * Math.sin(Math.PI * t)};
}

export function peelPose(f: number, span: Span) {
  const t = eased(f, span);
  const curl = Math.sin(Math.PI * t);
  return {transform: `translate(${-12 * curl}px,${-18 * curl}px) rotateX(${-22 * curl}deg) rotateZ(${4 * curl}deg)`,
    lift: curl};
}

export function ringState(f: number, span: Span, from: number, to: number) {
  const t = eased(f, span);
  return {offset: 1 - t, value: Math.round(mix(from, to, t))};
}

export function orbitPose(
  f: number, span: Span, index: number, count: number, rx: number, ry: number, orbitAngle: number,
) {
  const angle = 2 * Math.PI * index / count + orbitAngle * eased(f, span);
  const depth = (1 + Math.sin(angle)) / 2;
  return {x: Math.cos(angle) * rx, y: Math.sin(angle) * ry, depth,
    scale: mix(.82, 1, depth), opacity: mix(.42, 1, depth)};
}

export function dotPose(f: number, span: Span, index: number, period: number) {
  if (f < span.start || f >= span.end) return {y: 0, opacity: 0};
  const wave = .5 + .5 * Math.sin(2 * Math.PI * (f - span.start) / period - index * 1.6);
  return {y: -7 * wave, opacity: mix(.42, 1, wave)};
}

export const lensTransform = (cx: number, cy: number, zoom: number) =>
  `translate(${cx} ${cy}) scale(${zoom}) translate(${-cx} ${-cy})`;

export function bloomPose(f: number, span: Span, maxRadius: number) {
  const t = phase(f, span);
  return {r: Math.max(1, maxRadius * easeOut(t)), opacity: .22 * Math.sin(Math.PI * t)};
}

export function pinPose(f: number, drop: Span, rebound: Span, distance: number) {
  const fall = phase(f, drop);
  const settle = phase(f, rebound);
  const bounce = Math.sin(Math.PI * settle) * (1 - settle);
  const height = distance * (1 - fall ** 2) + distance * .08 * bounce;
  return {y: -height, scale: 1 - .06 * bounce,
    shadowScale: mix(.65, 1, fall), shadowOpacity: mix(.08, .24, fall) * (1 - .25 * bounce)};
}

export function blendView(from: CameraView, to: CameraView, progress: number): CameraView {
  const t = clamp(progress);
  if (t === 0) return from;
  if (t === 1) return to;
  return {
    x: mix(from.x, to.x, t),
    y: mix(from.y, to.y, t),
    zoom: from.zoom * (to.zoom / from.zoom) ** t,
  };
}

export type CameraKey = CameraView & {frame: number; roll?: number; stop?: boolean};
type CameraSample = CameraView & {roll: number};
type CameraChannel = "x" | "y" | "logZoom" | "roll";

export function createCameraTrack(keys: readonly CameraKey[]) {
  if (keys.length === 0) throw new Error("Camera track needs at least one key.");
  const points = keys.map(({frame, x, y, zoom, roll = 0, stop}, index) => {
    if (![frame, x, y, zoom, roll].every(Number.isFinite) || zoom <= 0 ||
      (index > 0 && frame <= keys[index - 1].frame)) {
      throw new Error("Camera keys need strictly increasing frames and positive finite zoom.");
    }
    return {frame, x, y, zoom, logZoom: Math.log(zoom), roll, stop};
  });
  const channels: readonly CameraChannel[] = ["x", "y", "logZoom", "roll"];
  const slopes = channels.map((channel) => points.map((point, i) => {
    if (i === 0 || i === points.length - 1 || point.stop) return 0;
    const before = points[i - 1], after = points[i + 1];
    const h0 = point.frame - before.frame, h1 = after.frame - point.frame;
    const m0 = (point[channel] - before[channel]) / h0;
    const m1 = (after[channel] - point[channel]) / h1;
    if (m0 * m1 <= 0) return 0;
    const w0 = 2 * h1 + h0, w1 = h1 + 2 * h0;
    return (w0 + w1) / (w0 / m0 + w1 / m1);
  }));

  return (frame: number): CameraSample => {
    const first = points[0], last = points[points.length - 1];
    const endpoint = frame <= first.frame ? first : frame >= last.frame ? last : undefined;
    if (endpoint) return {x: endpoint.x, y: endpoint.y, zoom: endpoint.zoom, roll: endpoint.roll};

    const right = points.findIndex((point) => point.frame >= frame);
    const a = points[right - 1], b = points[right];
    if (frame === b.frame) return {x: b.x, y: b.y, zoom: b.zoom, roll: b.roll};
    const duration = b.frame - a.frame;
    const t = (frame - a.frame) / duration;
    const t2 = t * t, t3 = t2 * t;
    const [x, y, logZoom, roll] = channels.map((channel, i) =>
      (2 * t3 - 3 * t2 + 1) * a[channel] +
      (t3 - 2 * t2 + t) * duration * slopes[i][right - 1] +
      (-2 * t3 + 3 * t2) * b[channel] +
      (t3 - t2) * duration * slopes[i][right]);
    return {x, y, zoom: Math.exp(logZoom), roll};
  };
}

export function stageTransform(view: CameraSample, home: CameraView, influence = 1) {
  const t = clamp(influence);
  const {x, y, zoom} = blendView(home, view, t);
  return `translate(960 540) rotate(${view.roll * t}) scale(${zoom}) translate(${-x} ${-y})`;
}

export function projectPoint(point: Point, view: CameraSample): Point {
  const angle = view.roll * Math.PI / 180;
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const dx = (point[0] - view.x) * view.zoom;
  const dy = (point[1] - view.y) * view.zoom;
  return [960 + cos * dx - sin * dy, 540 + sin * dx + cos * dy];
}

export function flightPose(
  f: number, span: Span, from: CameraView, to: CameraView, bend: number, rollDegrees: number,
  influence = 1,
) {
  const t = eased(f, span);
  const weight = clamp(influence);
  const view = blendView(from, to, t * weight);
  const arc = 16 * t ** 2 * (1 - t) ** 2 * weight;
  return `translate(960 540) rotate(${rollDegrees * arc}) scale(${view.zoom}) translate(${-view.x} ${-view.y - bend * arc})`;
}

export function dollyScales(f: number, span: Span, ratio: number) {
  const t = eased(f, span);
  const scale = ratio ** t;
  return {foreground: scale, background: 1 / scale};
}

export function revealGeometry(
  f: number, span: Span, center: Point, feather: number, width: number, height: number,
) {
  const [cx, cy] = center;
  const limit = Math.hypot(Math.max(Math.abs(cx), Math.abs(width - cx)),
    Math.max(Math.abs(cy), Math.abs(height - cy)));
  const edge = Math.max(1, feather);
  const radius = (limit + edge) * eased(f, span);
  return {
    radius: Math.max(1, radius),
    innerStop: Math.max(0, 1 - edge / Math.max(1, radius)),
    opacity: smooth(clamp(radius / edge)),
  };
}

export function FeatheredReveal({frame, span, center, feather, plate, children, width = 1920, height = 1080}: {
  frame: number; span: Span; center: Point; feather: number; plate: ReactNode; children: ReactNode;
  width?: number; height?: number;
}) {
  const id = svgId("reveal-", useId());
  const complete = frame >= span.end;
  const {radius, innerStop, opacity} = revealGeometry(frame, span, center, feather, width, height);
  return (
    <g>
      <defs>
        <radialGradient id={id + "-edge"} gradientUnits="userSpaceOnUse"
          cx={center[0]} cy={center[1]} r={radius}>
          <stop offset={innerStop} stopColor="white" stopOpacity={opacity} />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id={id} maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse"
          x="0" y="0" width={width} height={height} style={{maskType: "alpha"}}>
          <rect width={width} height={height} fill={`url(#${id}-edge)`} />
        </mask>
      </defs>
      <g mask={complete ? undefined : `url(#${id})`} opacity={frame <= span.start ? 0 : 1}>
        {plate}
        {children}
      </g>
    </g>
  );
}

export function slashPath(f: number, span: Span, w: number, h: number, skew: number) {
  const extra = Math.abs(skew) + 2;
  const x = mix(-extra, w + extra, eased(f, span));
  return `M 0 0 H ${Math.max(0, x + skew)} L ${Math.max(0, x - skew)} ${h} H 0 Z`;
}
