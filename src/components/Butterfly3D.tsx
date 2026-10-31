"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

// Živý 3D motýl (three.js): tělo z koulí, tykadla, dvě křídla s vlastní texturou a skutečným mácháním.
// Než se scéna načte (nebo když WebGL není, nebo má člověk omezený pohyb), zůstává 3D render z Blenderu.
export function Butterfly3D({ size = 84, className = "" }: { size?: number; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const host = box.current;
    if (!host || prefersReducedMotion()) return;
    let stop = false;
    let cleanup = () => {};

    import("three")
      .then((THREE) => {
        if (stop) return;
        let renderer: InstanceType<typeof THREE.WebGLRenderer>;
        try {
          renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        } catch {
          return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(size, size);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.domElement.style.cssText = "width:100%;height:100%;display:block";
        host.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
        camera.position.set(0, 1.4, 5.4);
        camera.lookAt(0, 0, 0);

        scene.add(new THREE.HemisphereLight(0xfff4e0, 0x6a4a9a, 1.5));
        const sun = new THREE.DirectionalLight(0xffffff, 2.2);
        sun.position.set(-2, 4, 4);
        scene.add(sun);
        const rim = new THREE.DirectionalLight(0xffb38a, 1.1);
        rim.position.set(3, -1, -3);
        scene.add(rim);

        // Křídlo: obrys z beziérů, mírná tloušťka, textura nakreslená do canvasu stejným obrysem.
        const OUT: [number, number, number, number, number, number][] = [
          [0.2, 0.8, 1.0, 1.2, 1.5, 1.0],
          [1.7, 0.8, 1.45, 0.35, 1.0, 0.15],
          [1.35, 0.0, 1.35, -0.7, 0.95, -0.95],
          [0.55, -1.15, 0.2, -0.7, 0, -0.2],
        ];
        const X1 = 1.75;
        const Y0 = -1.2;
        const Y1 = 1.25;
        const shape = new THREE.Shape();
        shape.moveTo(0, 0.1);
        for (const c of OUT) shape.bezierCurveTo(...c);
        const wingGeo = new THREE.ExtrudeGeometry(shape, {
          depth: 0.035,
          bevelEnabled: true,
          bevelThickness: 0.012,
          bevelSize: 0.012,
          bevelSegments: 1,
          curveSegments: 20,
        });
        const pos = wingGeo.attributes.position;
        const uv = wingGeo.attributes.uv;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          uv.setXY(i, x / X1, (y - Y0) / (Y1 - Y0));
          // Křídlo se k okraji lehce prohne dozadu, ať působí prostorově.
          pos.setZ(i, pos.getZ(i) - 0.16 * x * x * 0.45 + 0.05 * Math.abs(y) * x);
        }
        wingGeo.computeVertexNormals();

        const S = 512;
        const cv = document.createElement("canvas");
        cv.width = cv.height = S;
        const g = cv.getContext("2d")!;
        const px = (x: number) => (x / X1) * S;
        const py = (y: number) => S - ((y - Y0) / (Y1 - Y0)) * S;
        const outline = new Path2D();
        outline.moveTo(px(0), py(0.1));
        for (const [a, b, c2, d, e, f] of OUT) outline.bezierCurveTo(px(a), py(b), px(c2), py(d), px(e), py(f));
        outline.closePath();
        g.save();
        g.clip(outline);
        const grad = g.createRadialGradient(px(0.1), py(0), 10, px(0.9), py(0.1), S * 0.85);
        grad.addColorStop(0, "#ff6f91");
        grad.addColorStop(0.35, "#ff9f2e");
        grad.addColorStop(0.8, "#ffd34d");
        grad.addColorStop(1, "#ffe9a0");
        g.fillStyle = grad;
        g.fillRect(0, 0, S, S);
        g.strokeStyle = "rgba(43,26,74,0.55)";
        g.lineWidth = 3;
        for (let k = 0; k < 7; k++) {
          const a = -0.5 + k * 0.28;
          g.beginPath();
          g.moveTo(px(0.05), py(0.05));
          g.quadraticCurveTo(px(0.7), py(0.05 + a * 0.6), px(1.55), py(a * 1.1 + 0.1));
          g.stroke();
        }
        g.fillStyle = "#fff6e0";
        for (const [x, y, r] of [[1.35, 0.85, 0.075], [1.1, 0.95, 0.055], [0.95, -0.7, 0.07], [1.15, -0.45, 0.05], [1.5, 0.6, 0.045]]) {
          g.beginPath();
          g.arc(px(x), py(y), r * S * 0.5, 0, Math.PI * 2);
          g.fill();
        }
        g.lineWidth = 26;
        g.strokeStyle = "#2b1a4a";
        g.stroke(outline);
        g.restore();
        const tex = new THREE.CanvasTexture(cv);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        const wingMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0, side: THREE.DoubleSide });

        const butterfly = new THREE.Group();
        const inkMat = new THREE.MeshStandardMaterial({ color: 0x2b1a4a, roughness: 0.5 });
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.62, 6, 14), inkMat);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), inkMat);
        head.position.y = 0.46;
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xfff6e0, roughness: 0.3 });
        for (const sx of [-1, 1]) {
          const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), eyeMat);
          eye.position.set(sx * 0.055, 0.5, 0.07);
          butterfly.add(eye);
          const ant = new THREE.Mesh(
            new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(sx * 0.03, 0.54, 0), new THREE.Vector3(sx * 0.14, 0.78, 0.04), new THREE.Vector3(sx * 0.3, 0.86, 0.02)), 10, 0.01, 6),
            inkMat,
          );
          const tip = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), inkMat);
          tip.position.set(sx * 0.3, 0.86, 0.02);
          butterfly.add(ant, tip);
        }
        butterfly.add(body, head);

        const wings: { pivot: InstanceType<typeof THREE.Group>; sx: number }[] = [];
        for (const sx of [-1, 1]) {
          const pivot = new THREE.Group();
          pivot.position.set(sx * 0.06, 0.08, 0);
          const wing = new THREE.Mesh(wingGeo, wingMat);
          wing.scale.x = sx;
          pivot.add(wing);
          butterfly.add(pivot);
          wings.push({ pivot, sx });
        }
        butterfly.rotation.x = -0.35;
        scene.add(butterfly);

        const clock = new THREE.Clock();
        let raf = 0;
        let visible = true;
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        io.observe(host);
        const tick = () => {
          raf = requestAnimationFrame(tick);
          if (!visible || document.hidden) return;
          const t = clock.getElapsedTime();
          // Mávání: rychlé mávnutí, pak chvíli plachtí; křídla se přitom lehce kroutí.
          const beat = Math.sin(t * 9) * (0.55 + 0.35 * Math.sin(t * 1.3));
          for (const { pivot, sx } of wings) {
            pivot.rotation.y = sx * (0.5 + beat);
            pivot.rotation.z = sx * 0.12 * Math.sin(t * 9 + 1);
          }
          butterfly.position.y = Math.sin(t * 2.4) * 0.12;
          butterfly.rotation.y = Math.sin(t * 0.8) * 0.45;
          butterfly.rotation.z = Math.sin(t * 1.1) * 0.12;
          renderer.render(scene, camera);
        };
        tick();
        setLive(true);

        cleanup = () => {
          cancelAnimationFrame(raf);
          io.disconnect();
          wingGeo.dispose();
          tex.dispose();
          wingMat.dispose();
          inkMat.dispose();
          eyeMat.dispose();
          scene.traverse((o) => {
            const m = o as InstanceType<typeof THREE.Mesh>;
            if (m.isMesh && m.geometry !== wingGeo) m.geometry.dispose();
          });
          renderer.dispose();
          renderer.domElement.remove();
        };
      })
      .catch((e) => console.warn("butterfly3d", e));

    return () => {
      stop = true;
      cleanup();
      setLive(false);
    };
  }, [size]);

  return (
    <div ref={box} aria-hidden className={`pointer-events-none select-none ${className}`} style={{ width: size, height: size }}>
      {!live && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/home/anim/motyl.webp" alt="" width={size} height={size} draggable={false} className="absolute inset-0 h-full w-full object-contain" />
      )}
    </div>
  );
}
