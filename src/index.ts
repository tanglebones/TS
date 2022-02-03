// istanbul ignore file -- bootstrap
import {memoize} from "./lib/memoize";

const x = memoize(()=>"is an test");
console.log(x());