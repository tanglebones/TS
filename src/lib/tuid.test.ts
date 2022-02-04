import * as assert from 'assert';
import * as sinon from 'sinon';
import { tuidFactoryCtor } from './tuid';

describe("tuid", () => {
  const getSut = () => {
    const randomFillSyncStub = sinon.stub();
    const nowMsStub = sinon.stub();
    const tuidFactory = tuidFactoryCtor(randomFillSyncStub, nowMsStub);
    return { tuidFactory, randomFillSyncStub, nowMsStub };
  };
  it("works", () => {
    const { tuidFactory, randomFillSyncStub, nowMsStub } = getSut();

    nowMsStub.returns(0x7777_7777_7777_7777n);
    assert.strictEqual("77777777777700000000000000000000", tuidFactory());
    assert.strictEqual("77777777777800000000000000000000", tuidFactory());

    randomFillSyncStub.callsFake((buffer: Buffer, start: number, count: number) => {
      const end = start + count;
      for (let i = start; i < end; ++i) {
        buffer[i] = 0xff;
      }
    });
    assert.strictEqual("777777777779ffffffffffffffffffff", tuidFactory());
  });
});