import { describe, expect, it } from "vitest";
import { getPhonemeMetadata } from "../phonemeMetadata";

describe("Phoneme Animation Metadata", () => {
  it("returns animation articulation for iː", () => {
    const metadata = getPhonemeMetadata("iː");

    expect(metadata).not.toBeNull();

    expect(metadata.animation).toBeDefined();
    expect(metadata.animation.type).toBe("phoneme");

    expect(metadata.animation.articulation).toEqual({
      tonguePosition: "high_front",
      lips: "spread",
      jaw: "closed",
      velum: "raised",
      vocalFolds: "vibrating",
      airflow: "continuous",
    });
  });

  it("returns animation articulation for θ", () => {
    const metadata = getPhonemeMetadata("θ");

    expect(metadata).not.toBeNull();

    expect(metadata.animation).toBeDefined();
    expect(metadata.animation.type).toBe("phoneme");

    expect(metadata.animation.articulation).toEqual({
      tonguePosition: "between_teeth",
      lips: "slightly_open",
      jaw: "half",
      velum: "raised",
      vocalFolds: "still",
      airflow: "continuous",
    });
  });

  it("preserves the authoritative iː source data", () => {
    const metadata = getPhonemeMetadata("iː");

    expect(metadata.example.word).toBe("sheep");
    expect(metadata.example.markup).toBe("sh<strong>ee</strong>p");

    expect(metadata.audio.file).toBe("Vowels_1a.mp3");

    expect(metadata.audio.src).toContain("Vowels_1a.mp3");
  });

  it("preserves the authoritative θ source data", () => {
    const metadata = getPhonemeMetadata("θ");

    expect(metadata.example.word).toBe("throw");
    expect(metadata.example.markup).toBe("<strong>th</strong>row");

    expect(metadata.audio.file).toBe("Consonants_11a.mp3");

    expect(metadata.audio.src).toContain("Consonants_11a.mp3");
  });
});
