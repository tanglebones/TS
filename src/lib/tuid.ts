/*
// original code

import {randomFillSync} from "crypto";
let lasttime = 0n;
export const tuidFactory = () => {
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

export const tuidHexToBase64url = (s: string) => Buffer.from(s, "hex").toString("base64url");
export const tuidBase64urlToHex = (s: string) => Buffer.from(s, "base64url").toString("hex");

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
 * @param format formats the result buffer into a string; defaults to the hexFormatter
 */
export const tuidFactoryCtor = (
  randomFillSync: (buffer: Buffer, offset: number, count: number) => void,
  nowMs: () => number,
  format: "hex" | "base64url" = "hex",
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
    return buffer.subarray(2, 18).toString(format);
  };
}

export const tuidEpochMicro = (tuid: string, format: "hex" | "base64url" | undefined = undefined) => {
  const buffer = Buffer.alloc(18);
  buffer[0] = 0;
  buffer[1] = 0;
  buffer.write(tuid, 2, format ?? "hex");
  const n = buffer.readBigInt64BE(0);
  return Number(n);
};

export const tuidForTestingFactoryCtor = (start = 0, format: "hex" | "base64url" | undefined = undefined) => {
  let n = BigInt(start);
  const fmt = format ?? "hex";
  return () => {
    const buffer = Buffer.alloc(18);
    buffer.writeBigInt64BE(n, 0);
    n += 1n;
    return buffer.subarray(2, 18).toString(fmt);
  };
};

// istanbul ignore next
export const tuidZeroHex = '00000000000000000000000000000000';
// istanbul ignore next
export const tuidZeroBase64url = tuidHexToBase64url(tuidZeroHex);
