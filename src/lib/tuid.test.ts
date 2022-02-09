import * as assert from 'assert';
import * as sinon from 'sinon';
import {tuidFactoryCtor, tuid, tuidFormatterType} from './tuid';

describe("tuid", () => {
  const getSut = (formatter: tuidFormatterType | undefined = undefined) => {
    const randomFillSyncStub = sinon.stub();
    const nowMsStub = sinon.stub();
    const tuidFactory = tuidFactoryCtor(randomFillSyncStub, nowMsStub, formatter);
    return {tuidFactory, randomFillSyncStub, nowMsStub};
  };
  it("works w/ default formatter", () => {
    const {tuidFactory, randomFillSyncStub, nowMsStub} = getSut();

    nowMsStub.returns(0x7770_7771_7772_777en);
    assert.strictEqual("77717772777e00000000000000000000", tuidFactory());
    assert.strictEqual("77717772777f00000000000000000000", tuidFactory());

    randomFillSyncStub.callsFake((buffer: Buffer, start: number, count: number) => {
      const end = start + count;
      for (let i = start; i < end; ++i) {
        buffer[i] = 0xff;
      }
    });
    assert.strictEqual("777177727780ffffffffffffffffffff", tuidFactory());
  });

  it("works w/ b64u formatter", () => {
    const {tuidFactory, randomFillSyncStub, nowMsStub} = getSut(tuid.base64urlFormatter);

    nowMsStub.returns(0x7770_7771_7772_777en);
    assert.strictEqual("d3F3cnd-AAAAAAAAAAAAAA", tuidFactory());
    assert.strictEqual("d3F3cnd_AAAAAAAAAAAAAA", tuidFactory());

    randomFillSyncStub.callsFake((buffer: Buffer, start: number, count: number) => {
      const end = start + count;
      for (let i = start; i < end; ++i) {
        buffer[i] = 0xff;
      }
    });
    assert.strictEqual("d3F3cneA_____________w", tuidFactory());
  });

  it("hexToBase64url", () => {
    assert.strictEqual("d3F3cnd-AAAAAAAAAAAAAA", tuid.hexToBase64url("77717772777e00000000000000000000"));
    assert.strictEqual("d3F3cnd_AAAAAAAAAAAAAA", tuid.hexToBase64url("77717772777f00000000000000000000"));
    assert.strictEqual("d3F3cneA_____________w", tuid.hexToBase64url("777177727780ffffffffffffffffffff"));
  });

  it("base64urlToHex", () => {
    assert.strictEqual("77717772777e00000000000000000000", tuid.base64urlToHex("d3F3cnd-AAAAAAAAAAAAAA"));
    assert.strictEqual("77717772777f00000000000000000000", tuid.base64urlToHex("d3F3cnd_AAAAAAAAAAAAAA"));
    assert.strictEqual("777177727780ffffffffffffffffffff", tuid.base64urlToHex("d3F3cneA_____________w"));
  });
});