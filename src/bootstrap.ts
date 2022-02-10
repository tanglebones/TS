import {randomFillSync} from "crypto";
import {tuidFactoryCtor} from "./lib/tuid";

const nowMs = () => +new Date();

export const tuidFactory = tuidFactoryCtor(
  randomFillSync,
  nowMs,
)

