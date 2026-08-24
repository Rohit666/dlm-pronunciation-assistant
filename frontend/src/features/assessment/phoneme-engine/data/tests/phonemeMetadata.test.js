import { describe, expect, it } from "vitest";

import { getPhonemeMetadata } from "../phonemeMetadata";

describe("Phoneme Metadata Registry", () => {
  it("returns metadata for iː", () => {
    const phoneme = getPhonemeMetadata("iː");

    expect(phoneme).not.toBeNull();
    expect(phoneme.symbol).toBe("iː");
    expect(phoneme.identity.category).toBe("vowel");
    expect(phoneme.example.word).toBe("sheep");
    expect(phoneme.audio.file).toBe("Vowels_1a.mp3");
    expect(phoneme.audio.src).toBeTruthy();
    expect(phoneme.audio.src).toContain("Vowels_1a.mp3");
  });
  it("contains the demonstration video for iː", () => {
    const metadata = getPhonemeMetadata("iː");
    expect(metadata.video).toBeDefined();
    expect(metadata.video.file).toBe("long-i.mp4");
    expect(metadata.video.src).toBeTruthy();
    expect(metadata.video.src).toContain("long-i.mp4");
  });
  it("returns metadata for θ", () => {
    const phoneme = getPhonemeMetadata("θ");

    expect(phoneme).not.toBeNull();
    expect(phoneme.symbol).toBe("θ");
    expect(phoneme.identity.category).toBe("consonant");
    expect(phoneme.example.word).toBe("throw");
    expect(phoneme.audio.file).toBe("Consonants_11a.mp3");
    expect(phoneme.audio.src).toBeTruthy();
    expect(phoneme.audio.src).toContain("Consonants_11a.mp3");
  });

  it("returns metadata for aʊ", () => {
    const phoneme = getPhonemeMetadata("aʊ");

    expect(phoneme).not.toBeNull();
    expect(phoneme.symbol).toBe("aʊ");
    expect(phoneme.identity.category).toBe("diphthong");
    expect(phoneme.example.word).toBe("how");
    expect(phoneme.audio.file).toBe("Diphthongs_8a.mp3");
    expect(phoneme.audio.src).toBeTruthy();
    expect(phoneme.audio.src).toContain("Diphthongs_8a.mp3");
  });

  it("returns null for an unknown phoneme", () => {
    const phoneme = getPhonemeMetadata("xyz");

    expect(phoneme).toBeNull();
  });
});
