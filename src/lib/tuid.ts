export const tuidFactoryCtor = (
  randomFillSync: (buffer: Buffer, offset: number, count: number) => void,
  nowMs: () => number,
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
    return buffer.subarray(2, 18).toString('hex');
  };
}
