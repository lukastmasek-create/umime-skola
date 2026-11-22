import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Bg, Fly } from "./ui";
import { C, S } from "./theme";
import "./fonts";
import { NudaHraj } from "./scenes/NudaHraj";
import { Hraj3D } from "./scenes/Hraj3D";
import { Kviz } from "./scenes/Kviz";
import { Materialy } from "./scenes/Materialy";
import { Code } from "./scenes/Code";
import { Scratch } from "./scenes/Scratch";
import { Outro } from "./scenes/Outro";

// Hudba a voice-over: soubory vlož do public/audio (viz README).
const HAS_VOICE = false;
const HAS_MUSIC = false;

export const Promo = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Bg />
    {(
      [
        ["nuda", NudaHraj, false],
        ["hraj", Hraj3D, true],
        ["kurzy", Kviz, true],
        ["materialy", Materialy, true],
        ["code", Code, true],
        ["scratch", Scratch, true],
        ["outro", Outro, true],
      ] as const
    ).map(([k, Scene, tilt]) => (
      <Sequence key={k} from={S[k][0]} durationInFrames={S[k][1]}>
        <Fly dur={S[k][1]} tilt={tilt}>
          <Scene />
        </Fly>
      </Sequence>
    ))}
    {HAS_MUSIC && <Audio src={staticFile("audio/music.mp3")} volume={0.35} />}
    {HAS_VOICE && <Audio src={staticFile("audio/voice.mp3")} volume={1} />}
  </AbsoluteFill>
);
