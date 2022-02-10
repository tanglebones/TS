// This is for reference and would not be use with bootstrap.ts
// Using providers is not preferred. They should only be used in projects where legacy code makes using a
// bootstrap.ts file difficult.

import {randomFillSync} from "crypto";
import {tuidFactoryCtor} from "./tuid";
import {memoize} from "./memoize";

const nowMs = () => +new Date();

export const tuidFactoryProvider = memoize(() => tuidFactoryCtor(
  randomFillSync,
  nowMs,
));
