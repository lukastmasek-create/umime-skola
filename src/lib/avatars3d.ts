// 3D postavy z Blenderu (umime-art/scripts/avatars.py), soubory .glb v public/avatars-3d.
// Každý model má animace "klid" (smyčka) a "radost" (jednou). Avatary bez modelu se kreslí jako SVG.
const MODELS: Record<string, string> = {
  cat: "/avatars-3d/cat.glb",
  robot: "/avatars-3d/robot.glb",
};

export function getAvatarModel(id: string | null | undefined): string | null {
  return (id && MODELS[id]) || null;
}

// Statické rendery téhož modelu: portrét do kulaté profilovky (256 × 256 px) a celá postava
// oříznutá podle obrysu (výška 256 px, šířka podle postavy) pro podium.
const STILLS: Record<string, { portrait: string; figure: { src: string; width: number; height: number } }> = {
  cat: { portrait: "/avatars-3d/cat-portret.webp", figure: { src: "/avatars-3d/cat-postava.webp", width: 156, height: 256 } },
  robot: { portrait: "/avatars-3d/robot-portret.webp", figure: { src: "/avatars-3d/robot-postava.webp", width: 142, height: 256 } },
};

export function getAvatarStills(id: string | null | undefined) {
  return (id && STILLS[id]) || null;
}

// Dekodér komprese Draco pro modely (zkopírovaný z three/examples/jsm/libs/draco/gltf).
export const DRACO_DECODER_PATH = "/draco/";
