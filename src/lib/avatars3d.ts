// 3D postavy z Blenderu (umime-art/scripts/avatars.py), soubory .glb v public/avatars-3d.
// Každý model má animace "klid" (smyčka) a "radost" (jednou). Avatary bez modelu se kreslí jako SVG.
const MODELS: Record<string, string> = {
  cat: "/avatars-3d/cat.glb",
  robot: "/avatars-3d/robot.glb",
};

export function getAvatarModel(id: string | null | undefined): string | null {
  return (id && MODELS[id]) || null;
}

// Dekodér komprese Draco pro modely (zkopírovaný z three/examples/jsm/libs/draco/gltf).
export const DRACO_DECODER_PATH = "/draco/";
