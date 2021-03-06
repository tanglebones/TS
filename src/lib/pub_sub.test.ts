import * as assert from 'assert';
import {pubSubCtorCtor} from './pub_sub';
import {registryFactory} from './registry';
import {tuidForTestingFactoryCtor} from "./tuid";

// testing bootstrap
const tuidFactory = tuidForTestingFactoryCtor(0);
const pubSubCtor = pubSubCtorCtor(tuidFactory, registryFactory);

describe('pubSub', () => {
  it('basics', async () => {
    const psp = pubSubCtor();
    const m1: string[] = [];
    const m2: string[] = [];
    psp.sub(async message => { m1.push(message) });
    const us2 = psp.sub(async message => { m2.push(message) });

    await psp.pub("1");
    await psp.pub("2");
    us2();
    await psp.pub("3");

    assert.deepStrictEqual(m1, ["1","2","3"]);
    assert.deepStrictEqual(m2, ["1","2"]);
  });
});