import { getSoundUrl } from "./soundAssets";
import { getVideoUrl } from "./videoAssets";
const PHONEME_METADATA = {
  iː: {
    symbol: "iː",

    identity: {
      id: 26,
      category: "vowel",
    },

    example: {
      word: "sheep",
      markup: "sh<strong>ee</strong>p",
    },

    audio: {
      file: "Vowels_1a.mp3",
      src: getSoundUrl("Vowels_1a.mp3"),
    },
    video: {
      file: "long-i.mp4",
      src: getVideoUrl("long-i.mp4"),
    },
    teaching: {
      name: "Long E",

      description:
        "A long, close front vowel sound. The tongue is raised toward the front of the mouth while the lips are slightly spread.",

      articulation: {
        tongue:
          "The front of the tongue is raised high toward the roof of the mouth.",
        lips: "The lips are slightly spread.",
        jaw: "The jaw is relatively closed.",
        airflow: "Air flows continuously through the mouth.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Smile slightly and raise the front of your tongue. Hold the sound steadily: eee.",

      commonMistakes: [
        "Making the sound too short.",
        "Using a more relaxed vowel instead of the long E sound.",
      ],
    },

    animation: {
      type: "phoneme",

      articulation: {
        tonguePosition: "high_front",
        lips: "spread",
        jaw: "closed",
        velum: "raised",
        vocalFolds: "vibrating",
        airflow: "continuous",
      },
    },
  },
  ɪ: {
    symbol: "ɪ",

    identity: {
      id: 27,
      category: "vowel",
    },

    example: {
      word: "ship",
      markup: "sh<strong>i</strong>p",
    },

    audio: {
      file: "Vowels_2a.mp3",
      src: getSoundUrl("Vowels_2a.mp3"),
    },
    video: {
      file: "short-i.mp4",
      src: getVideoUrl("short-i.mp4"),
    },

    teaching: {
      name: "Short I",

      description:
        "A short, near-close front vowel produced with the tongue raised toward the front of the mouth, but less high than /iː/.",

      articulation: {
        tongue:
          "Raise the front of the tongue high in the mouth, but keep it slightly lower and more relaxed than for /iː/.",
        lips: "Keep the lips relaxed and slightly spread.",
        jaw: "Keep the jaw relatively closed.",
        airflow: "Air flows continuously.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Keep the sound short and relaxed. Do not stretch it into the long E sound /iː/.",

      commonMistakes: [
        "Making the sound too long.",
        "Replacing /ɪ/ with /iː/.",
      ],
    },
  },

  ʊ: {
    symbol: "ʊ",

    identity: {
      id: 37,
      category: "vowel",
    },

    example: {
      word: "put",
      markup: "p<strong>u</strong>t",
    },

    audio: {
      file: "Vowels_3a.mp3",
      src: getSoundUrl("Vowels_3a.mp3"),
    },
    video: {
      file: "short-ʊ.mp4",
      src: getVideoUrl("short-ʊ.mp4"),
    },

    teaching: {
      name: "Short U",

      description: "A short near-close back vowel with gentle lip rounding.",

      articulation: {
        tongue:
          "Raise the back of the tongue toward the roof of the mouth without making the position as tense as /uː/.",
        lips: "Round the lips gently.",
        jaw: "Keep the jaw fairly closed.",
        airflow: "Air flows continuously.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Keep the sound short and relaxed. Use gentle lip rounding rather than a strong /uː/ shape.",

      commonMistakes: [
        "Making the vowel too long.",
        "Using the tense long /uː/ sound.",
      ],
    },
  },

  uː: {
    symbol: "uː",

    identity: {
      id: 36,
      category: "vowel",
    },

    example: {
      word: "boot",
      markup: "b<strong>oo</strong>t",
    },

    audio: {
      file: "Vowels_4a.mp3",
      src: getSoundUrl("Vowels_4a.mp3"),
    },
    video: {
      file: "long-u.mp4",
      src: getVideoUrl("long-u.mp4"),
    },
    teaching: {
      name: "Long U",

      description:
        "A long close back rounded vowel produced with the back of the tongue raised and the lips rounded.",

      articulation: {
        tongue: "Raise the back of the tongue high toward the soft palate.",
        lips: "Round the lips noticeably.",
        jaw: "Keep the jaw relatively closed.",
        airflow: "Air flows continuously.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Round your lips and hold the sound steadily: ooo.",

      commonMistakes: [
        "Making the sound too short.",
        "Failing to round the lips.",
      ],
    },
  },

  e: {
    symbol: "e",

    identity: {
      id: 28,
      category: "vowel",
    },

    example: {
      word: "bed",
      markup: "b<strong>e</strong>d",
    },

    audio: {
      file: "Vowels_5a.mp3",
      src: getSoundUrl("Vowels_5a.mp3"),
    },
    video: {
      file: "short-e.mp4",
      src: getVideoUrl("short-e.mp4"),
    },

    teaching: {
      name: "Short E",

      description:
        "A short mid-front vowel produced with the tongue toward the front of the mouth.",

      articulation: {
        tongue: "Raise the front of the tongue to a mid position.",
        lips: "Keep the lips relaxed and slightly spread.",
        jaw: "Keep the jaw slightly open.",
        airflow: "Air flows continuously.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Keep the vowel relaxed and short, with the tongue toward the front of the mouth.",

      commonMistakes: [
        "Making it sound like /ɪ/.",
        "Opening the mouth too widely.",
      ],
    },
  },

  ə: {
    symbol: "ə",

    identity: {
      id: 35,
      category: "vowel",
    },

    example: {
      word: "better",
      markup: "bett<strong>er</strong>",
    },

    audio: {
      file: "Vowels_6a.mp3",
      src: getSoundUrl("Vowels_6a.mp3"),
    },
    video: {
      file: "short-ə.mp4",
      src: getVideoUrl("short-ə.mp4"),
    },
    teaching: {
      name: "Schwa",

      description:
        "A relaxed central vowel commonly found in unstressed syllables.",

      articulation: {
        tongue: "Keep the tongue relaxed in a central position.",
        lips: "Keep the lips relaxed and neutral.",
        jaw: "Keep the jaw slightly open.",
        airflow: "Air flows continuously.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Relax the mouth and produce a short, neutral sound. Do not over-articulate it.",

      commonMistakes: [
        "Giving the vowel too much stress.",
        "Using a strong full vowel instead of a relaxed schwa.",
      ],
    },
  },

  ɜː: {
    symbol: "ɜː",

    identity: {
      id: 29,
      category: "vowel",
    },

    example: {
      word: "bird",
      markup: "b<strong>ir</strong>d",
    },

    audio: {
      file: "Vowels_7a.mp3",
      src: getSoundUrl("Vowels_7a.mp3"),
    },
    video: {
      file: "long-ɜ.mp4",
      src: getVideoUrl("long-ɜ.mp4"),
    },
    teaching: {
      name: "Long Central Vowel",

      description:
        "A long central vowel produced with the tongue held in a central position and the mouth relatively relaxed.",

      articulation: {
        tongue: "Keep the tongue in a mid central position.",
        lips: "Keep the lips relaxed.",
        jaw: "Keep the jaw moderately open.",
        airflow: "Air flows continuously.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Keep the tongue central and relaxed, and hold the vowel steadily.",

      commonMistakes: [
        "Moving the tongue too far forward or backward.",
        "Making the vowel too short.",
      ],
    },
  },

  ɔː: {
    symbol: "ɔː",

    identity: {
      id: 33,
      category: "vowel",
    },

    example: {
      word: "fork",
      markup: "f<strong>or</strong>k",
    },

    audio: {
      file: "Vowels_8a.mp3",
      src: getSoundUrl("Vowels_8a.mp3"),
    },
    video: {
      file: "long-ɔ.mp4",
      src: getVideoUrl("long-ɔ.mp4"),
    },

    teaching: {
      name: "Long Open-O",

      description:
        "A long rounded back vowel produced with the tongue toward the back of the mouth.",

      articulation: {
        tongue:
          "Raise the back of the tongue while keeping the vowel relatively open.",
        lips: "Round the lips gently.",
        jaw: "Keep the jaw moderately open.",
        airflow: "Air flows continuously.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Open the mouth comfortably, round the lips slightly, and hold the vowel.",

      commonMistakes: [
        "Making the vowel too short.",
        "Using excessive lip rounding.",
      ],
    },
  },

  æ: {
    symbol: "æ",

    identity: {
      id: 30,
      category: "vowel",
    },

    example: {
      word: "cat",
      markup: "c<strong>a</strong>t",
    },

    audio: {
      file: "Vowels_9a.mp3",
      src: getSoundUrl("Vowels_9a.mp3"),
    },
    video: {
      file: "short-æ.mp4",
      src: getVideoUrl("short-æ.mp4"),
    },

    teaching: {
      name: "Short A",

      description:
        "A short open front vowel produced with the front of the tongue low in the mouth.",

      articulation: {
        tongue: "Keep the front of the tongue low and toward the front.",
        lips: "Keep the lips relaxed.",
        jaw: "Open the jaw noticeably.",
        airflow: "Air flows continuously.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Open your mouth and keep the tongue low and forward. Keep the sound short.",

      commonMistakes: [
        "Closing the jaw too much.",
        "Replacing it with a more central vowel.",
      ],
    },
  },

  ʌ: {
    symbol: "ʌ",

    identity: {
      id: 34,
      category: "vowel",
    },

    example: {
      word: "cut",
      markup: "c<strong>u</strong>t",
    },

    audio: {
      file: "Vowels_10a.mp3",
      src: getSoundUrl("Vowels_10a.mp3"),
    },
    video: {
      file: "short-ʌ.mp4",
      src: getVideoUrl("short-ʌ.mp4"),
    },
    teaching: {
      name: "Short U",

      description:
        "A short open-mid central/back vowel with a relaxed tongue position.",

      articulation: {
        tongue: "Keep the tongue in a relaxed central position.",
        lips: "Keep the lips neutral.",
        jaw: "Keep the jaw moderately open.",
        airflow: "Air flows continuously.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Relax your tongue and keep the sound short and central.",

      commonMistakes: [
        "Rounding the lips too much.",
        "Making the sound too far back.",
      ],
    },
  },

  ɑː: {
    symbol: "ɑː",

    identity: {
      id: 31,
      category: "vowel",
    },

    example: {
      word: "calm",
      markup: "c<strong>al</strong>m",
    },

    audio: {
      file: "Vowels_11a.mp3",
      src: getSoundUrl("Vowels_11a.mp3"),
    },
    video: {
      file: "long-ɑ.mp4",
      src: getVideoUrl("long-ɑ.mp4"),
    },

    teaching: {
      name: "Long A",

      description:
        "A long open back vowel produced with the tongue low and positioned toward the back.",

      articulation: {
        tongue: "Keep the tongue low and toward the back of the mouth.",
        lips: "Keep the lips neutral.",
        jaw: "Open the jaw comfortably.",
        airflow: "Air flows continuously.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Open the mouth comfortably, keep the tongue low and back, and hold the vowel.",

      commonMistakes: [
        "Closing the jaw too much.",
        "Moving the tongue too far forward.",
      ],
    },
  },

  ɒ: {
    symbol: "ɒ",

    identity: {
      id: 32,
      category: "vowel",
    },

    example: {
      word: "hot",
      markup: "h<strong>o</strong>t",
    },

    audio: {
      file: "Vowels_12a.mp3",
      src: getSoundUrl("Vowels_12a.mp3"),
    },
    video: {
      file: "short-ɒ.mp4",
      src: getVideoUrl("short-ɒ.mp4"),
    },

    teaching: {
      name: "Short Open O",

      description: "A short open back rounded vowel.",

      articulation: {
        tongue: "Keep the tongue low and toward the back.",
        lips: "Round the lips lightly.",
        jaw: "Keep the jaw open.",
        airflow: "Air flows continuously.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Open your mouth, keep the tongue low and back, and use gentle lip rounding.",

      commonMistakes: [
        "Making the vowel too long.",
        "Rounding the lips too strongly.",
      ],
    },
  },
  // Diphthongs

  ɪə: {
    symbol: "ɪə",

    identity: {
      id: 43,
      category: "diphthong",
    },

    example: {
      word: "here",
      markup: "h<strong>ere</strong>",
    },

    audio: {
      file: "Diphthongs_1a.mp3",
      src: getSoundUrl("Diphthongs_1a.mp3"),
    },
    video: {
      file: "diph-ɪə.mp4",
      src: getVideoUrl("diph-ɪə.mp4"),
    },

    teaching: {
      name: "Near-Front Diphthong",

      description:
        "A diphthong that moves from a near-front vowel toward a relaxed central position.",

      articulation: {
        tongue:
          "Begin toward the front and move smoothly toward a more central position.",
        lips: "Keep the lips relaxed.",
        jaw: "Begin relatively closed and relax slightly.",
        airflow: "Air flows continuously while the mouth position changes.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Move smoothly between the two vowel positions rather than producing two separate sounds.",

      commonMistakes: [
        "Breaking the diphthong into two separate vowels.",
        "Stopping the airflow between the two parts.",
      ],
    },
  },

  eɪ: {
    symbol: "eɪ",

    identity: {
      id: 41,
      category: "diphthong",
    },

    example: {
      word: "make",
      markup: "m<strong>a</strong>ke",
    },

    audio: {
      file: "Diphthongs_2a.mp3",
      src: getSoundUrl("Diphthongs_2a.mp3"),
    },
    video: {
      file: "diph-eɪ.mp4",
      src: getVideoUrl("diph-eɪ.mp4"),
    },

    teaching: {
      name: "AY Sound",

      description:
        "A diphthong that moves from a mid-front vowel toward a higher front position.",

      articulation: {
        tongue:
          "Begin in a mid-front position and move upward toward the front.",
        lips: "Keep the lips relaxed with slight spreading.",
        jaw: "Begin slightly open and close gently.",
        airflow: "Air flows continuously.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Start with an open 'eh' sound and glide smoothly toward 'ee'.",

      commonMistakes: [
        "Producing only the first vowel.",
        "Making the two parts sound disconnected.",
      ],
    },
  },

  ʊə: {
    symbol: "ʊə",

    identity: {
      id: 45,
      category: "diphthong",
    },

    example: {
      word: "tour",
      markup: "t<strong>ou</strong>r",
    },

    audio: {
      file: "Diphthongs_3a.mp3",
      src: getSoundUrl("Diphthongs_3a.mp3"),
    },
    video: {
      file: "diph-ʊə.mp4",
      src: getVideoUrl("diph-ʊə.mp4"),
    },

    teaching: {
      name: "UH-to-Schwa Diphthong",

      description:
        "A diphthong moving from a rounded near-back vowel toward a central relaxed position.",

      articulation: {
        tongue: "Begin toward the back and move toward a central position.",
        lips: "Begin with gentle rounding and relax the lips.",
        jaw: "Keep the jaw relatively closed and relax slightly.",
        airflow: "Air flows continuously.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Start with a rounded /ʊ/-like position and glide smoothly toward the central ending.",

      commonMistakes: [
        "Holding the first part too long.",
        "Turning the sound into two separate vowels.",
      ],
    },
  },

  ɔɪ: {
    symbol: "ɔɪ",

    identity: {
      id: 40,
      category: "diphthong",
    },

    example: {
      word: "boy",
      markup: "b<strong>oy</strong>",
    },

    audio: {
      file: "Diphthongs_4a.mp3",
      src: getSoundUrl("Diphthongs_4a.mp3"),
    },
    video: {
      file: "diph-ɔɪ.mp4",
      src: getVideoUrl("diph-ɔɪ.mp4"),
    },
    teaching: {
      name: "OY Sound",

      description:
        "A diphthong that moves from a rounded back vowel toward a close front vowel.",

      articulation: {
        tongue: "Begin toward the back and move forward and upward.",
        lips: "Begin rounded and gradually spread.",
        jaw: "Begin more open and close as the sound moves forward.",
        airflow: "Air flows continuously.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Start with an 'aw' position and glide smoothly into the short E area.",

      commonMistakes: [
        "Producing two separate vowels.",
        "Failing to move the tongue forward.",
      ],
    },
  },

  əʊ: {
    symbol: "əʊ",

    identity: {
      id: 42,
      category: "diphthong",
    },

    example: {
      word: "hello",
      markup: "hell<strong>o</strong>",
    },

    audio: {
      file: "Diphthongs_5a.mp3",
      src: getSoundUrl("Diphthongs_5a.mp3"),
    },
    video: {
      file: "diph-əʊ.mp4",
      src: getVideoUrl("diph-əʊ.mp4"),
    },

    teaching: {
      name: "OH Sound",

      description:
        "A diphthong moving from a relaxed central starting point toward a rounded back position.",

      articulation: {
        tongue: "Begin centrally and move toward a higher back position.",
        lips: "Move from relaxed lips toward rounded lips.",
        jaw: "Begin slightly open and close as the sound progresses.",
        airflow: "Air flows continuously.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Start relaxed and smoothly move toward a rounded ending.",

      commonMistakes: [
        "Keeping the mouth position fixed.",
        "Making the two parts sound disconnected.",
      ],
    },
  },

  eə: {
    symbol: "eə",

    identity: {
      id: 44,
      category: "diphthong",
    },

    example: {
      word: "where",
      markup: "w<strong>here</strong>",
    },

    audio: {
      file: "Diphthongs_6a.mp3",
      src: getSoundUrl("Diphthongs_6a.mp3"),
    },
    video: {
      file: "diph-eə.mp4",
      src: getVideoUrl("diph-eə.mp4"),
    },

    teaching: {
      name: "AIR Sound",

      description:
        "A diphthong that moves from a mid-front vowel toward a central relaxed vowel.",

      articulation: {
        tongue: "Begin toward the front and move toward the center.",
        lips: "Keep the lips relaxed.",
        jaw: "Begin slightly open and relax toward the ending.",
        airflow: "Air flows continuously.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Start with the front vowel position and glide smoothly into the relaxed ending.",

      commonMistakes: [
        "Stopping the movement too early.",
        "Producing two separate vowels.",
      ],
    },
  },

  aɪ: {
    symbol: "aɪ",

    identity: {
      id: 38,
      category: "diphthong",
    },

    example: {
      word: "high",
      markup: "h<strong>igh</strong>",
    },

    audio: {
      file: "Diphthongs_7a.mp3",
      src: getSoundUrl("Diphthongs_7a.mp3"),
    },
    video: {
      file: "diph-aɪ.mp4",
      src: getVideoUrl("diph-aɪ.mp4"),
    },
    teaching: {
      name: "I Sound",

      description:
        "A diphthong that moves from an open vowel toward a close front vowel.",

      articulation: {
        tongue: "Begin low and move upward and forward.",
        lips: "Begin relaxed and move toward a slightly spread position.",
        jaw: "Begin open and close as the sound rises.",
        airflow: "Air flows continuously.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Start with an open 'ah' position and glide smoothly toward 'ee'.",

      commonMistakes: [
        "Producing only the first part.",
        "Producing a very sharp or disconnected transition.",
      ],
    },
  },

  aʊ: {
    symbol: "aʊ",

    identity: {
      id: 39,
      category: "diphthong",
    },

    example: {
      word: "how",
      markup: "h<strong>ow</strong>",
    },

    audio: {
      file: "Diphthongs_8a.mp3",
      src: getSoundUrl("Diphthongs_8a.mp3"),
    },
    video: {
      file: "diph-aʊ.mp4",
      src: getVideoUrl("diph-aʊ.mp4"),
    },
    teaching: {
      name: "OW Sound",

      description:
        "A diphthong that moves from an open vowel position toward a rounded back position.",

      articulation: {
        tongue: "Begin low and move toward the back and upward.",
        lips: "Begin relaxed and become increasingly rounded.",
        jaw: "Begin open and close gradually.",
        airflow: "Air flows continuously.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Start with an open 'ah' position and smoothly move toward a rounded 'oo' position.",

      commonMistakes: [
        "Producing two separate vowels.",
        "Not rounding the lips enough at the end.",
      ],
    },
  },
  // Consonants
  θ: {
    symbol: "θ",

    identity: {
      id: 13,
      category: "consonant",
    },

    example: {
      word: "throw",
      markup: "<strong>th</strong>row",
    },

    audio: {
      file: "Consonants_11a.mp3",
      src: getSoundUrl("Consonants_11a.mp3"),
    },
    video: {
      file: "cons-θ.mp4",
      src: getVideoUrl("cons-θ.mp4"),
    },
    teaching: {
      name: "Voiceless TH",

      description:
        "A voiceless dental fricative produced by placing the tongue near or lightly between the teeth and allowing air to pass through.",

      articulation: {
        tongue:
          "Place the tip of the tongue lightly between or just behind the upper and lower teeth.",
        lips: "Keep the lips relaxed.",
        jaw: "Keep the jaw slightly open.",
        airflow: "Push air gently through the narrow space around the tongue.",
        voicing: "The vocal cords do not vibrate.",
      },

      tip: "Place your tongue gently between your teeth and blow air. Do not use your voice.",

      commonMistakes: [
        "Replacing θ with /t/.",
        "Replacing θ with /f/.",
        "Adding voice and producing /ð/ instead.",
      ],
    },

    animation: {
      type: "phoneme",

      articulation: {
        tonguePosition: "between_teeth",
        lips: "slightly_open",
        jaw: "half",
        velum: "raised",
        vocalFolds: "still",
        airflow: "continuous",
      },
    },
  },
  p: {
    symbol: "p",

    identity: {
      id: 1,
      category: "consonant",
    },

    example: {
      word: "pack",
      markup: "<strong>p</strong>ack",
    },

    audio: {
      file: "Consonants_1a.mp3",
      src: getSoundUrl("Consonants_1a.mp3"),
    },
    video: {
      file: "cons-p.mp4",
      src: getVideoUrl("cons-p.mp4"),
    },

    teaching: {
      name: "Voiceless P",

      description:
        "A voiceless bilabial plosive produced by closing both lips and releasing the air suddenly.",

      articulation: {
        tongue: "The tongue remains relaxed.",
        lips: "Close both lips firmly, then release them.",
        jaw: "Keep the jaw relaxed.",
        airflow: "Build pressure and release it in a short burst.",
        voicing: "The vocal cords do not vibrate.",
      },

      tip: "Close your lips, build a little air pressure, then release it quickly without using your voice.",

      commonMistakes: [
        "Adding voicing.",
        "Failing to release the air clearly.",
      ],
    },
  },

  b: {
    symbol: "b",

    identity: {
      id: 2,
      category: "consonant",
    },

    example: {
      word: "back",
      markup: "<strong>b</strong>ack",
    },

    audio: {
      file: "Consonants_2a.mp3",
      src: getSoundUrl("Consonants_2a.mp3"),
    },
    video: {
      file: "cons-b.mp4",
      src: getVideoUrl("cons-b.mp4"),
    },

    teaching: {
      name: "Voiced B",

      description:
        "A voiced bilabial plosive produced by closing the lips and releasing a short burst of air.",

      articulation: {
        tongue: "The tongue remains relaxed.",
        lips: "Close both lips firmly and release them.",
        jaw: "Keep the jaw relaxed.",
        airflow: "Release the built-up pressure in a short burst.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Close your lips, turn your voice on, and release the lips quickly.",

      commonMistakes: [
        "Producing the sound without voicing.",
        "Making the release too weak.",
      ],
    },
  },

  t: {
    symbol: "t",

    identity: {
      id: 3,
      category: "consonant",
    },

    example: {
      word: "tie",
      markup: "<strong>t</strong>ie",
    },

    audio: {
      file: "Consonants_3a.mp3",
      src: getSoundUrl("Consonants_3a.mp3"),
    },
    video: {
      file: "cons-t.mp4",
      src: getVideoUrl("cons-t.mp4"),
    },

    teaching: {
      name: "Voiceless T",

      description:
        "A voiceless alveolar plosive produced by briefly stopping airflow with the tongue and releasing it.",

      articulation: {
        tongue:
          "Place the tongue tip against the alveolar ridge behind the upper teeth.",
        lips: "Keep the lips relaxed.",
        jaw: "Keep the jaw slightly open.",
        airflow: "Build pressure behind the tongue and release it.",
        voicing: "The vocal cords do not vibrate.",
      },

      tip: "Touch the tongue tip to the ridge behind the upper teeth, stop the air briefly, then release it.",

      commonMistakes: [
        "Using voice during the closure.",
        "Placing the tongue too far back.",
      ],
    },
  },

  d: {
    symbol: "d",

    identity: {
      id: 4,
      category: "consonant",
    },

    example: {
      word: "do",
      markup: "<strong>d</strong>o",
    },

    audio: {
      file: "Consonants_4a.mp3",
      src: getSoundUrl("Consonants_4a.mp3"),
    },
    video: {
      file: "cons-d.mp4",
      src: getVideoUrl("cons-d.mp4"),
    },
    teaching: {
      name: "Voiced D",

      description:
        "A voiced alveolar plosive produced with the tongue tip against the alveolar ridge.",

      articulation: {
        tongue: "Place the tongue tip against the alveolar ridge.",
        lips: "Keep the lips relaxed.",
        jaw: "Keep the jaw slightly open.",
        airflow: "Stop airflow briefly and release it.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Use the same tongue position as /t/, but turn your voice on.",

      commonMistakes: [
        "Producing /t/ instead.",
        "Moving the tongue too far back.",
      ],
    },
  },

  tʃ: {
    symbol: "tʃ",

    identity: {
      id: 20,
      category: "consonant",
    },

    example: {
      word: "chicken",
      markup: "<strong>ch</strong>icken",
    },

    audio: {
      file: "Consonants_5a.mp3",
      src: getSoundUrl("Consonants_5a.mp3"),
    },
    video: {
      file: "cons-tʃ.mp4",
      src: getVideoUrl("cons-tʃ.mp4"),
    },
    teaching: {
      name: "CH Sound",

      description:
        "A voiceless postalveolar affricate combining a brief stop with frication.",

      articulation: {
        tongue:
          "Move the tongue toward the area just behind the alveolar ridge.",
        lips: "Keep the lips slightly relaxed, with mild rounding.",
        jaw: "Keep the jaw slightly open.",
        airflow: "Release the closure into a continuous fricative airflow.",
        voicing: "The vocal cords do not vibrate.",
      },

      tip: "Begin with a short stop and immediately release into a soft /ʃ/-like airflow.",

      commonMistakes: ["Producing only /t/.", "Producing only /ʃ/."],
    },
  },

  dʒ: {
    symbol: "dʒ",

    identity: {
      id: 21,
      category: "consonant",
    },

    example: {
      word: "judge",
      markup: "jud<strong>ge</strong>",
    },

    audio: {
      file: "Consonants_6a.mp3",
      src: getSoundUrl("Consonants_6a.mp3"),
    },
    video: {
      file: "cons-dʒ.mp4",
      src: getVideoUrl("cons-dʒ.mp4"),
    },

    teaching: {
      name: "J Sound",

      description:
        "A voiced postalveolar affricate combining a brief stop with frication.",

      articulation: {
        tongue: "Place the tongue toward the postalveolar region.",
        lips: "Use slight lip rounding.",
        jaw: "Keep the jaw slightly open.",
        airflow: "Release the stop into continuous fricative airflow.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Begin with a brief closure and release smoothly into the voiced fricative.",

      commonMistakes: [
        "Producing only /d/.",
        "Losing the voicing during the release.",
      ],
    },
  },

  k: {
    symbol: "k",

    identity: {
      id: 5,
      category: "consonant",
    },

    example: {
      word: "class",
      markup: "<strong>c</strong>lass",
    },

    audio: {
      file: "Consonants_7a.mp3",
      src: getSoundUrl("Consonants_7a.mp3"),
    },
    video: {
      file: "cons-k.mp4",
      src: getVideoUrl("cons-k.mp4"),
    },
    teaching: {
      name: "Voiceless K",

      description:
        "A voiceless velar plosive produced by briefly blocking airflow with the back of the tongue.",

      articulation: {
        tongue: "Raise the back of the tongue toward the soft palate.",
        lips: "Keep the lips relaxed.",
        jaw: "Keep the jaw slightly open.",
        airflow: "Build pressure behind the tongue and release it.",
        voicing: "The vocal cords do not vibrate.",
      },

      tip: "Lift the back of your tongue, stop the air, then release it sharply.",

      commonMistakes: [
        "Using the front of the tongue instead of the back.",
        "Adding voicing.",
      ],
    },
  },

  g: {
    symbol: "g",

    identity: {
      id: 6,
      category: "consonant",
    },

    example: {
      word: "glass",
      markup: "<strong>g</strong>lass",
    },

    audio: {
      file: "Consonants_8a.mp3",
      src: getSoundUrl("Consonants_8a.mp3"),
    },
    video: {
      file: "cons-g.mp4",
      src: getVideoUrl("cons-g.mp4"),
    },
    teaching: {
      name: "Voiced G",

      description:
        "A voiced velar plosive produced by raising the back of the tongue toward the soft palate.",

      articulation: {
        tongue: "Raise the back of the tongue toward the soft palate.",
        lips: "Keep the lips relaxed.",
        jaw: "Keep the jaw slightly open.",
        airflow: "Stop airflow briefly and release it.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Use the same tongue position as /k/, but turn your voice on.",

      commonMistakes: [
        "Producing /k/ instead.",
        "Placing the tongue too far forward.",
      ],
    },
  },

  f: {
    symbol: "f",

    identity: {
      id: 11,
      category: "consonant",
    },

    example: {
      word: "foot",
      markup: "<strong>f</strong>oot",
    },

    audio: {
      file: "Consonants_9a.mp3",
      src: getSoundUrl("Consonants_9a.mp3"),
    },
    video: {
      file: "cons-f.mp4",
      src: getVideoUrl("cons-f.mp4"),
    },
    teaching: {
      name: "Voiceless F",

      description:
        "A voiceless labiodental fricative produced by bringing the lower lip close to the upper teeth.",

      articulation: {
        tongue: "Keep the tongue relaxed.",
        lips: "Bring the lower lip gently toward the upper teeth.",
        jaw: "Keep the jaw relaxed.",
        airflow: "Allow continuous air through the narrow opening.",
        voicing: "The vocal cords do not vibrate.",
      },

      tip: "Touch the lower lip lightly against the upper teeth and let air flow through.",

      commonMistakes: ["Biting the lower lip too hard.", "Adding voicing."],
    },
  },

  v: {
    symbol: "v",

    identity: {
      id: 12,
      category: "consonant",
    },

    example: {
      word: "van",
      markup: "<strong>v</strong>an",
    },

    audio: {
      file: "Consonants_10a.mp3",
      src: getSoundUrl("Consonants_10a.mp3"),
    },
    video: {
      file: "cons-v.mp4",
      src: getVideoUrl("cons-v.mp4"),
    },

    teaching: {
      name: "Voiced V",

      description:
        "A voiced labiodental fricative produced with the lower lip close to the upper teeth.",

      articulation: {
        tongue: "Keep the tongue relaxed.",
        lips: "Bring the lower lip gently toward the upper teeth.",
        jaw: "Keep the jaw relaxed.",
        airflow: "Allow continuous airflow through the narrow opening.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Use the /f/ lip position, but switch your voice on.",

      commonMistakes: [
        "Producing /f/ instead.",
        "Closing the lips completely.",
      ],
    },
  },
  ð: {
    symbol: "ð",

    identity: {
      id: 14,
      category: "consonant",
    },

    example: {
      word: "though",
      markup: "<strong>th</strong>ough",
    },

    audio: {
      file: "Consonants_12a.mp3",
      src: getSoundUrl("Consonants_12a.mp3"),
    },
    video: {
      file: "cons-ð.mp4",
      src: getVideoUrl("cons-ð.mp4"),
    },
    teaching: {
      name: "Voiced TH",

      description:
        "A voiced dental fricative produced by placing the tongue near or lightly between the teeth.",

      articulation: {
        tongue:
          "Place the tongue tip lightly between or just behind the upper and lower teeth.",
        lips: "Keep the lips relaxed.",
        jaw: "Keep the jaw slightly open.",
        airflow: "Allow continuous air through the narrow opening.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Place the tongue gently near the teeth, let the air pass, and turn your voice on.",

      commonMistakes: [
        "Replacing /ð/ with /d/.",
        "Replacing /ð/ with /z/.",
        "Producing voiceless /θ/ instead.",
      ],
    },
  },

  s: {
    symbol: "s",

    identity: {
      id: 15,
      category: "consonant",
    },

    example: {
      word: "sing",
      markup: "<strong>s</strong>ing",
    },

    audio: {
      file: "Consonants_13a.mp3",
      src: getSoundUrl("Consonants_13a.mp3"),
    },
    video: {
      file: "cons-s.mp4",
      src: getVideoUrl("cons-s.mp4"),
    },

    teaching: {
      name: "Voiceless S",

      description:
        "A voiceless alveolar fricative produced with a narrow central airflow passage.",

      articulation: {
        tongue:
          "Place the tongue close to the alveolar ridge and form a narrow channel for air.",
        lips: "Keep the lips relaxed.",
        jaw: "Keep the jaw slightly open.",
        airflow: "Air flows continuously through the narrow channel.",
        voicing: "The vocal cords do not vibrate.",
      },

      tip: "Keep the tongue close to the ridge behind the teeth and let a narrow stream of air pass.",

      commonMistakes: ["Adding voicing.", "Making the airflow too broad."],
    },
  },

  z: {
    symbol: "z",

    identity: {
      id: 16,
      category: "consonant",
    },

    example: {
      word: "zoo",
      markup: "<strong>z</strong>oo",
    },

    audio: {
      file: "Consonants_14a.mp3",
      src: getSoundUrl("Consonants_14a.mp3"),
    },
    video: {
      file: "cons-z.mp4",
      src: getVideoUrl("cons-z.mp4"),
    },
    teaching: {
      name: "Voiced Z",

      description:
        "A voiced alveolar fricative produced with the same general tongue position as /s/ but with vocal-fold vibration.",

      articulation: {
        tongue:
          "Place the tongue close to the alveolar ridge and create a narrow airflow channel.",
        lips: "Keep the lips relaxed.",
        jaw: "Keep the jaw slightly open.",
        airflow: "Air flows continuously.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Use the tongue position of /s/, but add voice.",

      commonMistakes: ["Producing /s/ instead.", "Using too much airflow."],
    },
  },

  ʃ: {
    symbol: "ʃ",

    identity: {
      id: 17,
      category: "consonant",
    },

    example: {
      word: "shoe",
      markup: "<strong>sh</strong>oe",
    },

    audio: {
      file: "Consonants_15a.mp3",
      src: getSoundUrl("Consonants_15a.mp3"),
    },
    video: {
      file: "cons-ʃ.mp4",
      src: getVideoUrl("cons-ʃ.mp4"),
    },
    teaching: {
      name: "SH Sound",

      description:
        "A voiceless postalveolar fricative produced with the tongue slightly behind the alveolar ridge and rounded lips.",

      articulation: {
        tongue:
          "Raise the tongue toward the area just behind the alveolar ridge.",
        lips: "Round the lips slightly.",
        jaw: "Keep the jaw slightly open.",
        airflow: "Allow continuous airflow through the narrow passage.",
        voicing: "The vocal cords do not vibrate.",
      },

      tip: "Move the tongue slightly back from /s/, round the lips gently, and let the air flow.",

      commonMistakes: ["Producing /s/ instead.", "Failing to round the lips."],
    },
  },

  ʒ: {
    symbol: "ʒ",

    identity: {
      id: 18,
      category: "consonant",
    },

    example: {
      word: "measure",
      markup: "mea<strong>s</strong>ure",
    },

    audio: {
      file: "Consonants_16a.mp3",
      src: getSoundUrl("Consonants_16a.mp3"),
    },
    video: {
      file: "cons-ʒ.mp4",
      src: getVideoUrl("cons-ʒ.mp4"),
    },

    teaching: {
      name: "Zh Sound",

      description:
        "A voiced postalveolar fricative produced with the tongue behind the alveolar ridge and gentle lip rounding.",

      articulation: {
        tongue: "Raise the tongue toward the postalveolar region.",
        lips: "Round the lips slightly.",
        jaw: "Keep the jaw slightly open.",
        airflow: "Allow continuous airflow.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Use the general tongue position of /ʃ/, but add voice.",

      commonMistakes: [
        "Producing /ʃ/ instead.",
        "Not maintaining continuous airflow.",
      ],
    },
  },

  m: {
    symbol: "m",

    identity: {
      id: 8,
      category: "consonant",
    },

    example: {
      word: "man",
      markup: "<strong>m</strong>an",
    },

    audio: {
      file: "Consonants_17a.mp3",
      src: getSoundUrl("Consonants_17a.mp3"),
    },
    video: {
      file: "cons-m.mp4",
      src: getVideoUrl("cons-m.mp4"),
    },
    teaching: {
      name: "M Sound",

      description:
        "A voiced bilabial nasal produced by closing the lips while air flows through the nose.",

      articulation: {
        tongue: "Keep the tongue relaxed.",
        lips: "Close both lips.",
        jaw: "Keep the jaw relaxed.",
        airflow: "Direct airflow through the nose.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Close your lips gently, turn your voice on, and let the sound resonate through your nose.",

      commonMistakes: [
        "Letting air escape through the mouth.",
        "Stopping the voice.",
      ],
    },
  },

  n: {
    symbol: "n",

    identity: {
      id: 9,
      category: "consonant",
    },

    example: {
      word: "sun",
      markup: "su<strong>n</strong>",
    },

    audio: {
      file: "Consonants_18a.mp3",
      src: getSoundUrl("Consonants_18a.mp3"),
    },
    video: {
      file: "cons-n.mp4",
      src: getVideoUrl("cons-n.mp4"),
    },

    teaching: {
      name: "N Sound",

      description:
        "A voiced alveolar nasal produced with the tongue at the alveolar ridge and airflow through the nose.",

      articulation: {
        tongue: "Place the tongue tip against the alveolar ridge.",
        lips: "Keep the lips relaxed.",
        jaw: "Keep the jaw slightly open.",
        airflow: "Direct airflow through the nose.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Touch the tongue tip to the ridge behind your upper teeth and let the sound flow through your nose.",

      commonMistakes: [
        "Blocking the nasal airflow.",
        "Moving the tongue too far back.",
      ],
    },
  },

  ŋ: {
    symbol: "ŋ",

    identity: {
      id: 10,
      category: "consonant",
    },

    example: {
      word: "sing",
      markup: "si<strong>ng</strong>",
    },

    audio: {
      file: "Consonants_19a.mp3",
      src: getSoundUrl("Consonants_19a.mp3"),
    },
    video: {
      file: "cons-ŋ.mp4",
      src: getVideoUrl("cons-ŋ.mp4"),
    },
    teaching: {
      name: "NG Sound",

      description:
        "A voiced velar nasal produced with the back of the tongue raised toward the soft palate.",

      articulation: {
        tongue: "Raise the back of the tongue toward the soft palate.",
        lips: "Keep the lips relaxed.",
        jaw: "Keep the jaw slightly open.",
        airflow: "Direct airflow through the nose.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Lift the back of your tongue as for /k/, but let the sound flow through your nose instead of releasing a burst.",

      commonMistakes: [
        "Adding a /g/ release.",
        "Using the tongue position of /n/.",
      ],
    },
  },
  h: {
    symbol: "h",

    identity: {
      id: 19,
      category: "consonant",
    },

    example: {
      word: "hot",
      markup: "<strong>h</strong>ot",
    },

    audio: {
      file: "Consonants_20a.mp3",
      src: getSoundUrl("Consonants_20a.mp3"),
    },
    video: {
      file: "cons-h.mp4",
      src: getVideoUrl("cons-h.mp4"),
    },
    teaching: {
      name: "H Sound",

      description:
        "A voiceless glottal fricative produced by allowing air to pass through the open vocal tract.",

      articulation: {
        tongue:
          "Keep the tongue relaxed and shaped according to the following vowel.",
        lips: "Take the shape needed for the following vowel.",
        jaw: "Keep the jaw relaxed.",
        airflow: "Allow continuous airflow through the glottis.",
        voicing: "The vocal cords do not vibrate.",
      },

      tip: "Start the airflow gently before the vowel without adding voice.",

      commonMistakes: [
        "Adding voicing.",
        "Stopping the airflow before the vowel begins.",
      ],
    },
  },

  l: {
    symbol: "l",

    identity: {
      id: 22,
      category: "consonant",
    },

    example: {
      word: "lot",
      markup: "<strong>l</strong>ot",
    },

    audio: {
      file: "Consonants_21a.mp3",
      src: getSoundUrl("Consonants_21a.mp3"),
    },
    video: {
      file: "cons-l.mp4",
      src: getVideoUrl("cons-l.mp4"),
    },
    teaching: {
      name: "L Sound",

      description:
        "A voiced alveolar lateral approximant produced with the tongue tip at the alveolar ridge while air passes around the sides of the tongue.",

      articulation: {
        tongue:
          "Place the tongue tip against the alveolar ridge and allow air to flow around the sides.",
        lips: "Keep the lips relaxed.",
        jaw: "Keep the jaw slightly open.",
        airflow: "Air flows around the sides of the tongue.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Touch the tongue tip behind the upper teeth and let the air move around the sides of the tongue.",

      commonMistakes: [
        "Blocking the side airflow.",
        "Using a flat tongue position.",
      ],
    },
  },

  r: {
    symbol: "r",

    identity: {
      id: 23,
      category: "consonant",
    },

    example: {
      word: "red",
      markup: "<strong>r</strong>ed",
    },

    audio: {
      file: "Consonants_22a.mp3",
      src: getSoundUrl("Consonants_22a.mp3"),
    },
    video: {
      file: "cons-r.mp4",
      src: getVideoUrl("cons-r.mp4"),
    },

    teaching: {
      name: "R Sound",

      description:
        "A voiced alveolar/postalveolar approximant produced without full tongue contact.",

      articulation: {
        tongue:
          "Curl or bunch the tongue slightly toward the roof of the mouth without touching it.",
        lips: "Keep the lips relaxed, with slight rounding if natural.",
        jaw: "Keep the jaw slightly open.",
        airflow: "Maintain smooth continuous airflow.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Raise or bunch your tongue without touching the roof of the mouth and keep the airflow smooth.",

      commonMistakes: [
        "Touching the roof of the mouth.",
        "Using an /l/-like tongue contact.",
      ],
    },
  },

  w: {
    symbol: "w",

    identity: {
      id: 25,
      category: "consonant",
    },

    example: {
      word: "wet",
      markup: "<strong>w</strong>et",
    },

    audio: {
      file: "Consonants_23a.mp3",
      src: getSoundUrl("Consonants_23a.mp3"),
    },
    video: {
      file: "cons-w.mp4",
      src: getVideoUrl("cons-w.mp4"),
    },

    teaching: {
      name: "W Sound",

      description:
        "A voiced labial-velar approximant produced with rounded lips and a raised back of the tongue.",

      articulation: {
        tongue: "Raise the back of the tongue toward the soft palate.",
        lips: "Round the lips strongly at the start of the sound.",
        jaw: "Keep the jaw slightly open.",
        airflow: "Maintain smooth continuous airflow.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Round your lips as if beginning /uː/ and smoothly move into the following vowel.",

      commonMistakes: [
        "Using only the lip movement without voicing.",
        "Keeping the lips too relaxed.",
      ],
    },
  },

  j: {
    symbol: "j",

    identity: {
      id: 24,
      category: "consonant",
    },

    example: {
      word: "yet",
      markup: "<strong>y</strong>et",
    },

    audio: {
      file: "Consonants_24a.mp3",
      src: getSoundUrl("Consonants_24a.mp3"),
    },
    video: {
      file: "cons-j.mp4",
      src: getVideoUrl("cons-j.mp4"),
    },
    teaching: {
      name: "Y Sound",

      description:
        "A voiced palatal approximant produced with the tongue raised toward the hard palate.",

      articulation: {
        tongue:
          "Raise the front of the tongue toward the hard palate without making contact.",
        lips: "Keep the lips relaxed.",
        jaw: "Keep the jaw slightly open.",
        airflow: "Maintain smooth continuous airflow.",
        voicing: "The vocal cords vibrate.",
      },

      tip: "Raise the tongue toward the roof of the mouth without touching it and glide into the following vowel.",

      commonMistakes: [
        "Making full tongue contact.",
        "Turning the sound into a vowel too early.",
      ],
    },
  },
};

export const getPhonemeMetadata = (symbol) => {
  return PHONEME_METADATA[symbol] ?? null;
};

export default PHONEME_METADATA;
