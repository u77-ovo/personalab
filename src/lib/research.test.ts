import { describe, expect, it } from "vitest";
import { calculateWeightedScore, extractEvidence, validateEvidence } from "./research";
describe("research integrity helpers", () => {
  it("calculates the documented weighted score", () => { expect(calculateWeightedScore({ why: 5, who: 5, what: 5, how: 5, validate: 5, next: 5 })).toBe(100); expect(calculateWeightedScore({ why: 0, who: 0, what: 0, how: 0, validate: 0, next: 0 })).toBe(0); });
  it("extracts participant quotes with traceable offsets", () => { const source = "访谈员：为什么？\n受访者：我不知道两个入口有什么区别。"; const [item] = extractEvidence(source); expect(item.line).toBe(2); expect(validateEvidence(source, item)).toBe(true); expect(source.slice(item.startOffset, item.endOffset)).toBe(item.exactQuote); });
  it("rejects a tampered quote", () => { const source = "受访者：原始文本"; const [item] = extractEvidence(source); expect(validateEvidence(source, { ...item, exactQuote: "被篡改的文本" })).toBe(false); });
});
