import fs from "node:fs";
import path from "node:path";
import { hasRemainingPollAttempts } from "../src/hooks/useKycController";

describe("polling and logging safeguards", () => {
  it("bounds polling attempts", () => {
    expect(hasRemainingPollAttempts(0, 5)).toBe(true);
    expect(hasRemainingPollAttempts(4, 5)).toBe(true);
    expect(hasRemainingPollAttempts(5, 5)).toBe(false);
  });

  it("avoids intentional sensitive-data logging in src", () => {
    const sourceRoot = path.join(__dirname, "..", "src");
    const files = fs.readdirSync(sourceRoot, { recursive: true }) as string[];
    const codeFiles = files.filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"));

    for (const relativeFile of codeFiles) {
      const fullPath = path.join(sourceRoot, relativeFile);
      const contents = fs.readFileSync(fullPath, "utf8");
      expect(contents).not.toMatch(/console\.(log|debug|info|warn|error)/);
    }
  });
});
