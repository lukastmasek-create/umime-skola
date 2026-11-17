import React from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {AlbumCard3D} from '../components/AlbumCard3D';
import {PlaylistCard3D} from '../components/PlaylistCard3D';
import {Player3D} from '../components/Player3D';
import {ContactShadow} from '../components/ContactShadow';
import {ALBUM_KEYS, PL_KEYS, cardState, morphToPlayer, pressAmount} from '../animation/gallery';
import {faceTexture, drawPlayerFace, drawPlaylistFace, albumFaceTex} from '../assets/faces';
import {HEROES} from '../assets/content';
import {Card3D} from '../components/Card3D';

/** All five gallery cards (albums that flip into playlists + the centre playlist that becomes the player). */
export const GalleryCards: React.FC = () => {
  const f = useCurrentFrame();
  const sts = [0, 1, 2, 3, 4].map((i) => cardState(i, f));
  const m = morphToPlayer(f);
  const mq = Math.round(m * 20) / 20;
  const morphTex = React.useMemo(() => (mq > 0 && mq < 1 ? faceTexture(`morph-${mq}`, (g) => { drawPlaylistFace(g, 'discover'); g.save(); g.globalAlpha = mq; drawPlayerFace(g, HEROES.daft, 0.0, {showPlay: false}); g.restore(); }) : undefined), [mq]);
  const prog = f > 1016 ? Math.min(0.2, (f - 1016) * 0.0006 + 0.02) : 0.02;
  return (
    <group>
      {[0, 1, 2, 3].map((i) => {
        const s = sts[i];
        return (
          <React.Fragment key={i}>
            <AlbumCard3D hero={ALBUM_KEYS[i]} playlist={PL_KEYS[i]} position={s.pos} rotation={[s.rotX, s.rotY, s.rotZ]} scale={s.scale} opacity={s.opacity} />
            {s.opacity > 0.05 && f < 1000 && <ContactShadow y={-2.599} w={2.2} d={1.2} opacity={0.4 * s.opacity} position={[s.pos.x, 0, s.pos.z]} />}
          </React.Fragment>
        );
      })}
      {(() => {
        const s = sts[4];
        if (f < 620) return null;
        if (m >= 1) return <Player3D hero="daft" press={pressAmount(f)} progress={prog} playing position={s.pos} rotation={[0, 0, 0]} scale={s.scale} />;
        if (m > 0 && morphTex) return <Player3D hero="daft" press={0} faceFront={morphTex} position={s.pos} rotation={[0, 0, 0]} scale={s.scale} opacity={s.opacity} />;
        return <PlaylistCard3D playlist={PL_KEYS[4]} position={s.pos} rotation={[0, 0, 0]} scale={s.scale} opacity={s.opacity} />;
      })()}
    </group>
  );
};
