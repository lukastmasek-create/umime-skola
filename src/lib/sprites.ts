// Spritesheety her z Blenderu (public/game-sprites/<hra>/). Popis každé hry je v <hra>.json:
// skupina = jeden list .webp, snímky jsou v mřížce a velikost buňky je 2× větší než ve hře.
// Když se list nenačte (nebo ještě nenačetl), draw() vrátí false a hra nakreslí původní tvar kódem.

type Group = { file: string; cell: [number, number]; cols: number; frames: Record<string, [number, number]> };
type Meta = { groups: Record<string, Group> };

export class Sprites {
  private meta: Meta | null = null;
  private images = new Map<string, HTMLImageElement>();

  constructor(private game: string) {
    fetch(`/game-sprites/${game}/${game}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((m: Meta | null) => {
        if (!m) return;
        this.meta = m;
        for (const g of Object.values(m.groups)) {
          const img = new Image();
          img.onload = () => this.images.set(g.file, img);
          img.src = `/game-sprites/${game}/${g.file}`;
        }
      })
      .catch(() => {});
  }

  has(group: string, frame: string): boolean {
    const g = this.meta?.groups[group];
    return !!g && !!g.frames[frame] && this.images.has(g.file);
  }

  // Nakreslí snímek se středem v (cx, cy). Bez w a h se použije polovina buňky (list je 2× ostřejší).
  draw(
    ctx: CanvasRenderingContext2D,
    group: string,
    frame: string,
    cx: number,
    cy: number,
    w?: number,
    h?: number,
    opts: { flip?: boolean; rot?: number; alpha?: number; anchorBottom?: boolean } = {},
  ): boolean {
    const g = this.meta?.groups[group];
    const pos = g?.frames[frame];
    const img = g && this.images.get(g.file);
    if (!g || !pos || !img) return false;
    const [cw, ch] = g.cell;
    const dw = w ?? cw / 2;
    const dh = h ?? ch / 2;
    ctx.save();
    if (opts.alpha !== undefined) ctx.globalAlpha *= opts.alpha;
    ctx.translate(cx, opts.anchorBottom ? cy - dh / 2 : cy);
    if (opts.rot) ctx.rotate(opts.rot);
    if (opts.flip) ctx.scale(-1, 1);
    ctx.drawImage(img, pos[0] * cw, pos[1] * ch, cw, ch, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
    return true;
  }

  get name() {
    return this.game;
  }
}
