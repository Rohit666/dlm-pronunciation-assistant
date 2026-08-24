import { describe, expect, it } from "vitest";
import { adaptAssessment } from "../../../adapter/assessmentAdapter";

describe("assessmentAdapter", () => {
  describe("word analysis", () => {
    it("does not include recognition-only inserted words", () => {
      const result = {
        assessment_document: {
          words: [
            {
              word: "Go",
              student_word: "Go",
              operation: "insertion",
              accuracy: 0,
              weak_phonemes: [],
              pronunciation: null,
            },
            {
              word: "The",
              student_word: "for",
              operation: "substitution",
              accuracy: 0,
              weak_phonemes: ["ð", "ə"],
              pronunciation: null,
            },
            {
              word: "three",
              student_word: "it",
              operation: "substitution",
              accuracy: 0,
              weak_phonemes: ["θ", "ɹ", "iː"],
              pronunciation: null,
            },
            {
              word: "boys",
              student_word: "boys.",
              operation: "exact_match",
              accuracy: 100,
              weak_phonemes: [],
              pronunciation: null,
            },
          ],
          pronunciation: {
            overall_accuracy: 33.33,
            weak_phonemes: [],
          },
        },

        feedback: {
          words: [],
        },

        recognition: {
          state: "partial_match",
          success: true,
          expected_text: "The three boys",
          detected_text: "Go for it boys.",
          recognized_words: 4,
          total_words: 3,
        },
      };

      const assessment = adaptAssessment(result);

      expect(assessment.wordAnalysis.map((word) => word.word)).toEqual([
        "The",
        "three",
        "boys",
      ]);
    });
  });
});
