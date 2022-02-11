// This is for reference and would not be use with bootstrap.ts
// Using providers is not preferred. They should only be used in projects where legacy code makes using a
// bootstrap.ts file difficult.

import {randomFillSync} from "crypto";
import {tuidFactoryCtor} from "../../../lib/tuid";
import {memoize} from "../../../lib/memoize";
import {nowMsProvider} from "./now_ms.provider";

export const tuidFactoryProvider = memoize(() => tuidFactoryCtor(
  randomFillSync,
  nowMsProvider(),
));
