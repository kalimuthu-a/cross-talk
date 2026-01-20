import { CrossTalk } from "./CrossTalk";

const GLOBAL_KEY = "__crossTalkSingleton__";
const globalScope = globalThis as typeof globalThis & {
  [GLOBAL_KEY]?: CrossTalk;
};

export const crossTalk = globalScope[GLOBAL_KEY] ?? new CrossTalk();
globalScope[GLOBAL_KEY] = crossTalk;
