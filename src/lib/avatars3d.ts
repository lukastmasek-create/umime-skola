// 3D postavy z Blenderu (umime-art/scripts/avatars.py a avatar_chars.py), soubory .glb v public/avatars-3d.
// Každý model má animace "klid" (smyčka) a "radost" (jednou). Avatary bez modelu se kreslí jako SVG.
//
// Statické rendery téhož modelu: portrét do kulaté profilovky (256 × 256 px) a celá postava
// oříznutá podle obrysu (výška 256 px, šířka podle postavy) pro podium.
// Soubor modelu je /avatars-3d/<soubor>.glb, rendery <soubor>-portret.webp a <soubor>-postava.webp.
const MODELS: Record<string, { file: string; figureWidth: number }> = {
  cat: { file: "cat", figureWidth: 156 },
  robot: { file: "robot", figureWidth: 142 },
  astronaut: { file: "astronaut", figureWidth: 144 },
  pirate: { file: "pirate", figureWidth: 150 },
  wizard: { file: "wizard", figureWidth: 148 },
  pumpkin: { file: "pumpkin", figureWidth: 151 },
  alien: { file: "alien", figureWidth: 145 },
  owl: { file: "owl", figureWidth: 149 },
  panda: { file: "panda", figureWidth: 157 },
  dragon: { file: "dragon", figureWidth: 187 },
  winter: { file: "winter", figureWidth: 138 },
  ghost: { file: "ghost", figureWidth: 155 },
  fox: { file: "fox", figureWidth: 168 },
  ninja: { file: "ninja", figureWidth: 151 },
  king: { file: "king", figureWidth: 132 },
  founder: { file: "founder", figureWidth: 129 },
  chemik: { file: "chemik", figureWidth: 141 },
};

export function getAvatarModel(id: string | null | undefined): string | null {
  const model = id ? MODELS[id] : undefined;
  return model ? `/avatars-3d/${model.file}.glb` : null;
}

export function getAvatarStills(id: string | null | undefined) {
  const model = id ? MODELS[id] : undefined;
  if (!model) return null;
  const base = `/avatars-3d/${model.file}`;
  return {
    portrait: `${base}-portret.webp`,
    figure: { src: `${base}-postava.webp`, width: model.figureWidth, height: 256 },
  };
}

// Dekodér komprese Draco pro modely (zkopírovaný z three/examples/jsm/libs/draco/gltf).
export const DRACO_DECODER_PATH = "/draco/";
