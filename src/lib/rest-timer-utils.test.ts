import { describe, expect, it } from "vitest";

import { parseRestTimeToSeconds } from "@/lib/rest-timer-utils";

describe("parseRestTimeToSeconds", () => {
  it("lê segundos com sufixo s", () => {
    expect(parseRestTimeToSeconds("60s")).toBe(60);
  });

  it("lê número puro como segundos", () => {
    expect(parseRestTimeToSeconds("90")).toBe(90);
  });

  it("lê minutos e segundos no formato m:ss", () => {
    expect(parseRestTimeToSeconds("1:30")).toBe(90);
  });

  it("lê minutos com sufixo min", () => {
    expect(parseRestTimeToSeconds("2 min")).toBe(120);
  });

  it.each([
    ["texto vazio", ""],
    ["null", null],
    ["undefined", undefined],
    ["texto ilegível", "abc"],
  ])("usa 60 segundos quando o intervalo é %s", (_scenario, restTime) => {
    expect(parseRestTimeToSeconds(restTime)).toBe(60);
  });
});
