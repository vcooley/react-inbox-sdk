const hashChars =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * A basic hash function. You shouldn't use this for anything that needs
 * to be cryptographically secure.
 */
export function makeHash(length: number): string {
  const result = new Array(length);
  for (let i = 0; i < length; i++) {
    result[i] = hashChars[Math.floor(Math.random() * hashChars.length)];
  }
  return result.join("");
}
