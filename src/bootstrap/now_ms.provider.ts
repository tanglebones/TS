// This is for reference and would not be use with bootstrap.ts
// Using providers is not preferred. They should only be used in projects where legacy code makes using a
// bootstrap.ts file difficult.

import {memoize} from "../lib/memoize";

export const nowMsProvider = memoize(() => () => +new Date());