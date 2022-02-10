/*
// original code

import {randomFillSync} from "crypto";
export const tuidFactory =  () => {
  let now = BigInt(+ Date.now());
  if (now <= lastTime) {
    now = lastTime + 1n;
  }
  lastTime = now;
  const buffer = Buffer.alloc(18);
  buffer.writeBigInt64BE(now, 0); // 8 bytes, of which we use 6 (48 bits)
  randomFillSync(buffer, 8, 10); // 10 bytes (80 bits)
  return buffer.subarray(2, 18).toString('hex');
};
*/

const hexFormatter = (buffer: Buffer) => buffer.toString("hex");
const base64urlFormatter = (buffer: Buffer) => buffer.toString("base64url");
const hexToBase64url = (s: string) => Buffer.from(s, "hex").toString("base64url");
const base64urlToHex = (s: string) => Buffer.from(s, "base64url").toString("hex");

export const tuid = {
  hexFormatter,
  base64urlFormatter,
  hexToBase64url,
  base64urlToHex,
};

export type tuidFormatterType = (Buffer) => string;

/**
 * Returns a 128bit time prefixed (48 bits) random (80 bits) identifier encoded as hex (by default)
 * Suitable for distributed system identifier generation.
 * Hard to guess (sparse), increasing security
 * Semi-monotonic, avoiding index performance issues seen by purely random identifiers
 * Ideally stored as a fixed length binary field in the DB. If using a varchar or transmitting via a string
 * the more compact base64url encoding should be used.
 *
 * @param randomFillSync matches https://nodejs.org/api/crypto.html#cryptorandomfillsyncbuffer-offset-size
 * @param nowMs returns the current milliseconds since unix epoc
 * @param formatter formats the result buffer into a string; defaults to the hexFormatter
 */
export const tuidFactoryCtor = (
  randomFillSync: (buffer: Buffer, offset: number, count: number) => void,
  nowMs: () => number,
  formatter: tuidFormatterType | undefined = undefined,
) => {
  let lastTime = 0n;
  return () => {
    let now = BigInt(nowMs());
    if (now <= lastTime) {
      now = lastTime + 1n;
    }
    lastTime = now;
    const buffer = Buffer.alloc(18);
    buffer.writeBigInt64BE(now, 0); // 8 bytes, of which we use 6 (48 bits)
    randomFillSync(buffer, 8, 10); // 10 bytes (80 bits)
    return (formatter ?? hexFormatter)(buffer.subarray(2, 18));
  };
}

