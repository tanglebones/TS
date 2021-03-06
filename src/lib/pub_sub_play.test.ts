import * as assert from 'assert';
import {pubSubPlayCtorCtor} from './pub_sub_play';
import {registryFactory} from './registry';
import {tuidForTestingFactoryCtor} from "./tuid";

// testing bootstrap
const tuidFactory = tuidForTestingFactoryCtor(0);
const pubSubPlayCtor = pubSubPlayCtorCtor(tuidFactory, registryFactory);

describe('pubSubPlay', () => {
  it('basics', async () => {
    const psp = pubSubPlayCtor();
    const m1: string[] = [];
    const m2: string[] = [];
    psp.sub(async message => { m1.push(message) });
    const us2 = psp.sub(async message => { m2.push(message) });

    await psp.pub("1");
    await psp.pub("2");

    assert.deepStrictEqual(m1, []);
    assert.deepStrictEqual(m2, []);

    await psp.play(2);
    await psp.pub("3");

    assert.deepStrictEqual(m1, ["1","2"]);
    assert.deepStrictEqual(m2, ["1","2"]);

    await psp.play(0);

    assert.deepStrictEqual(m1, ["1","2"]);
    assert.deepStrictEqual(m2, ["1","2"]);

    us2();

    await psp.play(4);

    assert.deepStrictEqual(m1, ["1","2","3"]);
    assert.deepStrictEqual(m2, ["1","2"]);

  });
});
