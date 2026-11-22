import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { C, S } from "./theme";
import "./fonts";
import { NudaHraj } from "./scenes/NudaHraj";
import { Hraj3D } from "./scenes/Hraj3D";
import { Mesto } from "./scenes/Mesto";
import { Kviz } from "./scenes/Kviz";
import { Outro } from "./scenes/Outro";

// Hudba a voice-over: soubory vlož do public/audio (viz README).
const HAS_VOICE = false;
const HAS_MUSIC = false;

export const Promo = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={S.nuda[0]} durationInFrames={S.nuda[1]}>
      <NudaHraj />
    </Sequence>
    <Sequence from={S.hraj[0]} durationInFrames={S.hraj[1]}>
      <Hraj3D />
    </Sequence>
    <Sequence from={S.mesto[0]} durationInFrames={S.mesto[1]}>
      <Mesto />
    </Sequence>
    <Sequence from={S.kviz[0]} durationInFrames={S.kviz[1]}>
      <Kviz />
    </Sequence>
    <Sequence from={S.outro[0]} durationInFrames={S.outro[1]}>
      <Outro />
    </Sequence>
    {HAS_MUSIC && <Audio src={staticFile("audio/music.mp3")} volume={0.35} />}
    {HAS_VOICE && <Audio src={staticFile("audio/voice.mp3")} volume={1} />}
  </AbsoluteFill>
);
