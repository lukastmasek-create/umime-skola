import Image from "next/image";

// Logo „učíme se hrou“ (zdroj: umime-art/logo/logo.mjs). Světlá a tmavá verze se přepínají
// v globals.css podle motivu, stejně jako barvy webu. Na úzkém telefonu se celé logo vedle
// ovládání nevejde, proto se tam ukáže jen ikona s kostičkami (stejná pro oba motivy).
const WIDTH = 943;
const HEIGHT = 107;

export function SiteLogo() {
  const full = "h-[26px] w-auto sm:h-[30px]";
  return (
    <>
      <span className="hidden min-[460px]:inline-flex">
        <Image
          src="/brand/logo.svg"
          alt="Učíme se hrou"
          width={WIDTH}
          height={HEIGHT}
          preload
          unoptimized
          className={`logo-light ${full}`}
        />
        <Image
          src="/brand/logo-tmave.svg"
          alt="Učíme se hrou"
          width={WIDTH}
          height={HEIGHT}
          preload
          unoptimized
          className={`logo-dark ${full}`}
        />
      </span>
      <Image
        src="/brand/ikona.svg"
        alt="Učíme se hrou"
        width={120}
        height={125}
        preload
        unoptimized
        className="h-8 w-auto min-[460px]:hidden"
      />
    </>
  );
}
