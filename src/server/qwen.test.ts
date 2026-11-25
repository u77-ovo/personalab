import { describe, expect, it } from "vitest";
import { QwenRequestError, parseQwenJson } from "./qwen";

describe("Qwen structured output parsing", () => {
  it("parses plain JSON and fenced JSON", () => {
    expect(parseQwenJson('{"ok":true}')).toEqual({ ok: true });
    expect(parseQwenJson('```json\n{"ok":true}\n```')).toEqual({ ok: true });
  });

  it("rejects non-JSON model output", () => {
    expect(() => parseQwenJson("not json")).toThrow(QwenRequestError);
  });
});
