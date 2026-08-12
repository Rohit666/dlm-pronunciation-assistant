const round = (value) => Math.round(value ?? 0);

const capitalize = (text = "") => text.charAt(0).toUpperCase() + text.slice(1);

const getCoachMessage = (accuracy) => {
  if (accuracy >= 95) {
    return {
      greeting: "Outstanding!",
      message:
        "Your pronunciation is extremely close to a native speaker. Keep maintaining this excellent clarity.",
    };
  }

  if (accuracy >= 85) {
    return {
      greeting: "Great Job!",
      message:
        "Your pronunciation is very good. A few sounds need a little more practice to sound completely natural.",
    };
  }

  if (accuracy >= 70) {
    return {
      greeting: "Nice Progress!",
      message:
        "You're improving well. Let's focus on a few pronunciation sounds together.",
    };
  }

  return {
    greeting: "Let's Improve Together!",
    message:
      "Every practice makes you better. We'll improve one sound at a time.",
  };
};

const adaptHero = (result) => {
  const pronunciation = result.assessment_document.pronunciation;

  return {
    score: round(pronunciation.overall_accuracy),

    message:
      "This score represents how closely your pronunciation matches a native speaker.",

    overallAccuracy: pronunciation.overall_accuracy,

    weakPhonemes: pronunciation.weak_phonemes ?? [],

    strongPhonemes: pronunciation.strong_phonemes ?? [],
  };
};

const adaptRecognition = (result) => {
  const recognition = result.recognition;
  const recognitionMessages = {
    success: {
      title: "Recognition Successful",
      message: "We understood your recording clearly and analysed it.",
    },

    partial_match: {
      title: "Recognition Partially Successful",
      message:
        "Some words were recognised. We analysed the parts we could understand.",
    },

    no_match: {
      title: "Could not recognise the sentence",
      message:
        "Your recording didn't match the expected sentence closely enough.",
    },

    no_speech: {
      title: "No Speech Detected",
      message: "We couldn't detect any speech. Please record again.",
    },
  };

  const ui =
    recognitionMessages[recognition.state] ?? recognitionMessages.success;

  return {
    status: recognition.success ? "SUCCESS" : "FAILED",
    state: recognition.state,
    title: ui.title,
    message: ui.message,
    recognisedWords: recognition.recognized_words,
    totalWords: recognition.total_words,
    recognisedLabel: `${recognition.recognized_words} of ${recognition.total_words} words recognised`,
    expectedText: recognition.expected_text,
    detectedText: recognition.detected_text,
  };
};

const adaptComparison = (result, words) => {
  const expected = [];
  const detected = [];

  words.forEach((word) => {
    const operation = word.operation;

    // -----------------------------
    // Exact match
    // -----------------------------
    if (operation === "exact_match") {
      expected.push({
        word: word.expected,
        status: "correct",
        id: word.id,
      });

      detected.push({
        word: word.detected,
        status: "correct",
        id: word.id,
      });

      return;
    }

    // -----------------------------
    // Substitution
    // -----------------------------
    if (operation === "substitution") {
      expected.push({
        word: word.expected,
        status: "incorrect",
        id: word.id,
      });

      detected.push({
        word: word.detected,
        status: "incorrect",
        expected: word.expected,
        id: word.id,
      });

      return;
    }

    // -----------------------------
    // Deletion
    // -----------------------------
    if (operation === "deletion") {
      expected.push({
        word: word.expected,
        status: "incorrect",
        id: word.id,
      });

      return;
    }

    // -----------------------------
    // Insertion
    // -----------------------------
    if (operation === "insertion") {
      detected.push({
        word: word.detected,
        status: "incorrect",
        id: word.id,
      });
    }
  });

  return {
    expectedText: result.recognition?.expected_text ?? "",

    detectedText: result.recognition?.detected_text ?? "",

    expected,

    detected,

    differenceCount: words.filter((word) => word.status === "incorrect").length,
  };
};

const adaptWordAnalysis = (result) => {
  const feedbackMap = new Map();

  (result.feedback?.words ?? []).forEach((feedback) => {
    feedbackMap.set(feedback.word.toLowerCase(), feedback);
  });

  return (result.assessment_document.words ?? []).map((backendWord, index) => {
    const feedback = feedbackMap.get(backendWord.word.toLowerCase()) ?? {};

    const accuracy = backendWord.accuracy ?? 0;

    const weakPhonemes = backendWord.weak_phonemes ?? [];

    const phonemeComparison =
      backendWord.pronunciation?.phoneme_comparison ?? null;

    return {
      // ---------- UI ----------
      id: backendWord.word.toLowerCase(),
      index,

      word: backendWord.word,

      expected: backendWord.word,

      detected: backendWord.student_word ?? null,

      detectedLabel: backendWord.student_word ?? "Not detected",

      score: Math.round(accuracy),

      status: accuracy >= 95 ? "correct" : "incorrect",

      issue:
        feedback.issue ??
        (backendWord.student_word
          ? `"${backendWord.word}" was recognised as "${backendWord.student_word}".`
          : `"${backendWord.word}" was not detected in your recording.`),

      recommendation:
        feedback.recommendation ?? feedback.messages?.join(" ") ?? "",

      // ---------- Speech Analysis ----------
      accuracy,

      operation: backendWord.operation,

      weakPhonemes,

      phoneme: weakPhonemes[0] ?? null,

      changedFeatures: feedback.changed_features ?? [],

      phonemeComparisons: feedback.phoneme_comparisons ?? [],

      practiceWords: feedback.practice_words ?? [],

      // NEW
      phonemeComparison,

      // ---------- Preserve backend ----------
      backend: {
        ...backendWord,
        feedback,
      },
    };
  });
};

const adaptCoach = (result) => {
  const pronunciation = result.assessment_document.pronunciation;

  return {
    ...getCoachMessage(pronunciation.overall_accuracy),

    focusSound: pronunciation.weak_phonemes?.[0] ?? null,
  };
};

export const adaptAssessment = (result) => {
  const words = adaptWordAnalysis(result);
  return {
    hero: adaptHero(result),
    recognition: adaptRecognition(result),
    comparison: adaptComparison(result, words),
    coach: adaptCoach(result),
    wordAnalysis: words,
  };
};
