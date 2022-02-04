// istanbul ignore file -- bootstrap
import {randomFillSync} from "crypto";
import {tuidFactoryCtor} from "./lib/tuid";

const tuidFactory = tuidFactoryCtor(
  randomFillSync,
  () => +new Date(),
)

const t = tuidFactory();
console.log(t.length, t);
