const maxPasswordBytes = 72;

export function validNewPassword(password: string): boolean {
  return Array.from(password).length >= 8 && new TextEncoder().encode(password).length <= maxPasswordBytes;
}
