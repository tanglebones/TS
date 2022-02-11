import {tuidFactoryProvider} from "./bootstrap/tuid.provider";

const tuidFactory = tuidFactoryProvider();

const t = tuidFactory();
console.log(t.length, t);
