import { describe, expect, it } from "vitest";

import PHONEME_METADATA, { getPhonemeMetadata } from "../phonemeMetadata";

const EXPECTED_PHONEMES = [
  // -------------------------
  // VOWELS
  // -------------------------
  {
    symbol: "iː",
    id: 26,
    category: "vowel",
    word: "sheep",
    markup: "sh<strong>ee</strong>p",
    audio: "Vowels_1a.mp3",
    video: "long-i.mp4",
  },
  {
    symbol: "ɪ",
    id: 27,
    category: "vowel",
    word: "ship",
    markup: "sh<strong>i</strong>p",
    audio: "Vowels_2a.mp3",
    video: "short-i.mp4",
  },
  {
    symbol: "ʊ",
    id: 37,
    category: "vowel",
    word: "put",
    markup: "p<strong>u</strong>t",
    audio: "Vowels_3a.mp3",
    video: "short-ʊ.mp4",
  },
  {
    symbol: "uː",
    id: 36,
    category: "vowel",
    word: "boot",
    markup: "b<strong>oo</strong>t",
    audio: "Vowels_4a.mp3",
    video: "long-u.mp4",
  },
  {
    symbol: "e",
    id: 28,
    category: "vowel",
    word: "bed",
    markup: "b<strong>e</strong>d",
    audio: "Vowels_5a.mp3",
    video: "short-e.mp4",
  },
  {
    symbol: "ə",
    id: 35,
    category: "vowel",
    word: "better",
    markup: "bett<strong>er</strong>",
    audio: "Vowels_6a.mp3",
    video: "short-ə.mp4",
  },
  {
    symbol: "ɜː",
    id: 29,
    category: "vowel",
    word: "bird",
    markup: "b<strong>ir</strong>d",
    audio: "Vowels_7a.mp3",
    video: "long-ɜ.mp4",
  },
  {
    symbol: "ɔː",
    id: 33,
    category: "vowel",
    word: "fork",
    markup: "f<strong>or</strong>k",
    audio: "Vowels_8a.mp3",
    video: "long-ɔ.mp4",
  },
  {
    symbol: "æ",
    id: 30,
    category: "vowel",
    word: "cat",
    markup: "c<strong>a</strong>t",
    audio: "Vowels_9a.mp3",
    video: "short-æ.mp4",
  },
  {
    symbol: "ʌ",
    id: 34,
    category: "vowel",
    word: "cut",
    markup: "c<strong>u</strong>t",
    audio: "Vowels_10a.mp3",
    video: "short-ʌ.mp4",
  },
  {
    symbol: "ɑː",
    id: 31,
    category: "vowel",
    word: "calm",
    markup: "c<strong>al</strong>m",
    audio: "Vowels_11a.mp3",
    video: "long-ɑ.mp4",
  },
  {
    symbol: "ɒ",
    id: 32,
    category: "vowel",
    word: "hot",
    markup: "h<strong>o</strong>t",
    audio: "Vowels_12a.mp3",
    video: "short-ɒ.mp4",
  },

  // -------------------------
  // DIPHTHONGS
  // -------------------------
  {
    symbol: "ɪə",
    id: 43,
    category: "diphthong",
    word: "here",
    markup: "h<strong>ere</strong>",
    audio: "Diphthongs_1a.mp3",
    video: "diph-ɪə.mp4",
  },
  {
    symbol: "eɪ",
    id: 41,
    category: "diphthong",
    word: "make",
    markup: "m<strong>a</strong>ke",
    audio: "Diphthongs_2a.mp3",
    video: "diph-eɪ.mp4",
  },
  {
    symbol: "ʊə",
    id: 45,
    category: "diphthong",
    word: "tour",
    markup: "t<strong>ou</strong>r",
    audio: "Diphthongs_3a.mp3",
    video: "diph-ʊə.mp4",
  },
  {
    symbol: "ɔɪ",
    id: 40,
    category: "diphthong",
    word: "boy",
    markup: "b<strong>oy</strong>",
    audio: "Diphthongs_4a.mp3",
    video: "diph-ɔɪ.mp4",
  },
  {
    symbol: "əʊ",
    id: 42,
    category: "diphthong",
    word: "hello",
    markup: "hell<strong>o</strong>",
    audio: "Diphthongs_5a.mp3",
    video: "diph-əʊ.mp4",
  },
  {
    symbol: "eə",
    id: 44,
    category: "diphthong",
    word: "where",
    markup: "w<strong>here</strong>",
    audio: "Diphthongs_6a.mp3",
    video: "diph-eə.mp4",
  },
  {
    symbol: "aɪ",
    id: 38,
    category: "diphthong",
    word: "high",
    markup: "h<strong>igh</strong>",
    audio: "Diphthongs_7a.mp3",
    video: "diph-aɪ.mp4",
  },
  {
    symbol: "aʊ",
    id: 39,
    category: "diphthong",
    word: "how",
    markup: "h<strong>ow</strong>",
    audio: "Diphthongs_8a.mp3",
    video: "diph-aʊ.mp4",
  },

  // -------------------------
  // CONSONANTS
  // -------------------------
  {
    symbol: "p",
    id: 1,
    category: "consonant",
    word: "pack",
    markup: "<strong>p</strong>ack",
    audio: "Consonants_1a.mp3",
    video: "cons-p.mp4",
  },
  {
    symbol: "b",
    id: 2,
    category: "consonant",
    word: "back",
    markup: "<strong>b</strong>ack",
    audio: "Consonants_2a.mp3",
    video: "cons-b.mp4",
  },
  {
    symbol: "t",
    id: 3,
    category: "consonant",
    word: "tie",
    markup: "<strong>t</strong>ie",
    audio: "Consonants_3a.mp3",
    video: "cons-t.mp4",
  },
  {
    symbol: "d",
    id: 4,
    category: "consonant",
    word: "do",
    markup: "<strong>d</strong>o",
    audio: "Consonants_4a.mp3",
    video: "cons-d.mp4",
  },
  {
    symbol: "tʃ",
    id: 20,
    category: "consonant",
    word: "chicken",
    markup: "<strong>ch</strong>icken",
    audio: "Consonants_5a.mp3",
    video: "cons-tʃ.mp4",
  },
  {
    symbol: "dʒ",
    id: 21,
    category: "consonant",
    word: "judge",
    markup: "jud<strong>ge</strong>",
    audio: "Consonants_6a.mp3",
    video: "cons-dʒ.mp4",
  },
  {
    symbol: "k",
    id: 5,
    category: "consonant",
    word: "class",
    markup: "<strong>c</strong>lass",
    audio: "Consonants_7a.mp3",
    video: "cons-k.mp4",
  },
  {
    symbol: "g",
    id: 6,
    category: "consonant",
    word: "glass",
    markup: "<strong>g</strong>lass",
    audio: "Consonants_8a.mp3",
    video: "cons-g.mp4",
  },
  {
    symbol: "f",
    id: 11,
    category: "consonant",
    word: "foot",
    markup: "<strong>f</strong>oot",
    audio: "Consonants_9a.mp3",
    video: "cons-f.mp4",
  },
  {
    symbol: "v",
    id: 12,
    category: "consonant",
    word: "van",
    markup: "<strong>v</strong>an",
    audio: "Consonants_10a.mp3",
    video: "cons-v.mp4",
  },
  {
    symbol: "θ",
    id: 13,
    category: "consonant",
    word: "throw",
    markup: "<strong>th</strong>row",
    audio: "Consonants_11a.mp3",
    video: "cons-θ.mp4",
  },
  {
    symbol: "ð",
    id: 14,
    category: "consonant",
    word: "though",
    markup: "<strong>th</strong>ough",
    audio: "Consonants_12a.mp3",
    video: "cons-ð.mp4",
  },
  {
    symbol: "s",
    id: 15,
    category: "consonant",
    word: "sing",
    markup: "<strong>s</strong>ing",
    audio: "Consonants_13a.mp3",
    video: "cons-s.mp4",
  },
  {
    symbol: "z",
    id: 16,
    category: "consonant",
    word: "zoo",
    markup: "<strong>z</strong>oo",
    audio: "Consonants_14a.mp3",
    video: "cons-z.mp4",
  },
  {
    symbol: "ʃ",
    id: 17,
    category: "consonant",
    word: "shoe",
    markup: "<strong>sh</strong>oe",
    audio: "Consonants_15a.mp3",
    video: "cons-ʃ.mp4",
  },
  {
    symbol: "ʒ",
    id: 18,
    category: "consonant",
    word: "measure",
    markup: "mea<strong>s</strong>ure",
    audio: "Consonants_16a.mp3",
    video: "cons-ʒ.mp4",
  },
  {
    symbol: "m",
    id: 8,
    category: "consonant",
    word: "man",
    markup: "<strong>m</strong>an",
    audio: "Consonants_17a.mp3",
    video: "cons-m.mp4",
  },
  {
    symbol: "n",
    id: 9,
    category: "consonant",
    word: "sun",
    markup: "su<strong>n</strong>",
    audio: "Consonants_18a.mp3",
    video: "cons-n.mp4",
  },
  {
    symbol: "ŋ",
    id: 10,
    category: "consonant",
    word: "sing",
    markup: "si<strong>ng</strong>",
    audio: "Consonants_19a.mp3",
    video: "cons-ŋ.mp4",
  },
  {
    symbol: "h",
    id: 19,
    category: "consonant",
    word: "hot",
    markup: "<strong>h</strong>ot",
    audio: "Consonants_20a.mp3",
    video: "cons-h.mp4",
  },
  {
    symbol: "l",
    id: 22,
    category: "consonant",
    word: "lot",
    markup: "<strong>l</strong>ot",
    audio: "Consonants_21a.mp3",
    video: "cons-l.mp4",
  },
  {
    symbol: "r",
    id: 23,
    category: "consonant",
    word: "red",
    markup: "<strong>r</strong>ed",
    audio: "Consonants_22a.mp3",
    video: "cons-r.mp4",
  },
  {
    symbol: "w",
    id: 25,
    category: "consonant",
    word: "wet",
    markup: "<strong>w</strong>et",
    audio: "Consonants_23a.mp3",
    video: "cons-w.mp4",
  },
  {
    symbol: "j",
    id: 24,
    category: "consonant",
    word: "yet",
    markup: "<strong>y</strong>et",
    audio: "Consonants_24a.mp3",
    video: "cons-j.mp4",
  },
];

describe("Phoneme Registry Integrity", () => {
  it("contains exactly 44 phonemes", () => {
    expect(Object.keys(PHONEME_METADATA)).toHaveLength(44);
  });

  it("contains the expected category counts", () => {
    const categories = Object.values(PHONEME_METADATA).reduce(
      (counts, phoneme) => {
        counts[phoneme.identity.category] =
          (counts[phoneme.identity.category] ?? 0) + 1;

        return counts;
      },
      {},
    );

    expect(categories).toEqual({
      vowel: 12,
      diphthong: 8,
      consonant: 24,
    });
  });

  it.each(EXPECTED_PHONEMES)(
    "preserves source mapping for $symbol",
    (expected) => {
      const metadata = getPhonemeMetadata(expected.symbol);

      expect(metadata).not.toBeNull();

      expect(metadata.identity.id).toBe(expected.id);
      expect(metadata.identity.category).toBe(expected.category);

      expect(metadata.example.word).toBe(expected.word);
      expect(metadata.example.markup).toBe(expected.markup);

      expect(metadata.audio.file).toBe(expected.audio);
      expect(metadata.audio.src).toBeTruthy();
      expect(metadata.audio.src).toContain(expected.audio);

      expect(metadata.video.file).toBe(expected.video);
      expect(metadata.video.src).toBeTruthy();
      expect(metadata.video.src).toContain(expected.video);
    },
  );

  it("does not contain duplicate phoneme symbols", () => {
    const symbols = Object.values(PHONEME_METADATA).map(
      (phoneme) => phoneme.symbol,
    );

    expect(new Set(symbols).size).toBe(symbols.length);
  });

  it("does not contain duplicate phoneme IDs", () => {
    const ids = Object.values(PHONEME_METADATA).map(
      (phoneme) => phoneme.identity.id,
    );

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has valid required metadata for every phoneme", () => {
    Object.values(PHONEME_METADATA).forEach((phoneme) => {
      expect(phoneme.symbol).toBeTruthy();

      expect(phoneme.identity).toBeDefined();
      expect(phoneme.identity.id).toBeTypeOf("number");
      expect(phoneme.identity.category).toBeTruthy();

      expect(phoneme.example).toBeDefined();
      expect(phoneme.example.word).toBeTruthy();
      expect(phoneme.example.markup).toBeTruthy();

      expect(phoneme.audio).toBeDefined();
      expect(phoneme.audio.file).toBeTruthy();
      expect(phoneme.audio.src).toBeTruthy();

      expect(phoneme.video).toBeDefined();
      expect(phoneme.video.file).toBeTruthy();
      expect(phoneme.video.src).toBeTruthy();

      expect(phoneme.teaching).toBeDefined();
      expect(phoneme.teaching.name).toBeTruthy();
      expect(phoneme.teaching.description).toBeTruthy();
      expect(phoneme.teaching.articulation).toBeDefined();
      expect(phoneme.teaching.tip).toBeTruthy();
      expect(Array.isArray(phoneme.teaching.commonMistakes)).toBe(true);
    });
  });
});
