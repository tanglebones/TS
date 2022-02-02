import * as assert from 'assert';
import {memoize} from './memoize';

describe('memoize', () => {
  it('calls once', () => {
    let c = 0;

    function f() {
      c += 1;
    }

    const g = memoize(f);

    assert(c === 0);

    g();
    assert(c === 1);

    g();
    assert(c === 1);
  });
});