import * as assert from 'assert';
import {memoize} from './memoize';

describe('memoize', () => {
  it('calls once', () => {
    function f() {
      f.c += 1;
    }
    f.c = 0;

    const g = memoize(f);

    assert(f.c === 0);

    g();
    // the linter sucks and assumes g() is pure and won't touch c. :(
    // @ts-ignore
    assert(f.c === 1);

    g();
    assert(f.c === 1);
  });
});