import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Bg, Fly } from "./ui";
import { C, S, VOICE_FROM } from "./theme";
import "./fonts";
import { Kviz } from "./scenes/Kviz";
import { Materialy } from "./scenes/Materialy";
import { Code } from "./scenes/Code";
import { Scratch } from "./scenes/Scratch";
import { Outro } from "./scenes/Outro";
import { Intro } from "./scenes/Intro";

// Hudba a voice-over: soubory vlož do public/audio (viz README).
const HAS_VOICE = true;
const HAS_MUSIC = false;

export const Promo = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Bg />
    {(
      [
        ["intro", Intro, false],
        ["kurzy", Kviz, true],
        ["materialy", Materialy, true],
        ["code", Code, true],
        ["scratch", Scratch, true],
        ["outro", Outro, "last"],
      ] as const
    ).map(([k, Scene, tilt]) => (
      <Sequence key={k} from={S[k][0]} durationInFrames={S[k][1]}>
        <Fly dur={S[k][1]} tilt={tilt !== false} last={tilt === "last"}>
          <Scene />
        </Fly>
      </Sequence>
    ))}
    {HAS_MUSIC && <Audio src={staticFile("audio/music.mp3")} volume={0.35} />}
    {HAS_VOICE && (
      <Sequence from={VOICE_FROM}>
        <Audio src={staticFile("audio/voice.mp3")} volume={1} />
      </Sequence>
    )}
  </AbsoluteFill>
);
