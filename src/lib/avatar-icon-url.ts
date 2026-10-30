// Adresa vlastní ikonky avatara (snímek přebarvené 3D postavy). `v` mění adresu po každé úpravě,
// takže prohlížeč může ikonku cachovat napořád.
export function avatarIconUrl(userId: string, v: number | null | undefined): string | null {
  return v ? `/api/avatar-ikona/${userId}?v=${v}` : null;
}
