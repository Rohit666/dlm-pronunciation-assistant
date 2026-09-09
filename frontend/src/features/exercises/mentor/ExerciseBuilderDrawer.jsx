import { useState } from "react";
import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import FormDrawer from "../../../components/common/FormDrawer";
import RichTextEditor from "../../../components/mentor/RichTextEditor";
import PrimaryButton from "../../../components/common/PrimaryButton";
import QUESTION_TYPES from "../../../constants/exerciseQuestionTypes";
import { createLessonExercise } from "../../../services/exerciseService";

const QUESTION_TYPE_OPTIONS = [
  { value: QUESTION_TYPES.MCQ, label: "Multiple Choice" },
  { value: QUESTION_TYPES.TRUE_FALSE, label: "True / False" },
  { value: QUESTION_TYPES.FILL_BLANK, label: "Fill in the Blank" },
  { value: QUESTION_TYPES.SENTENCE_FORMATION, label: "Sentence Formation" },
  { value: QUESTION_TYPES.COMPREHENSION, label: "Comprehension" },
  { value: QUESTION_TYPES.PARAGRAPH, label: "Paragraph Writing" },
];

let localIdCounter = 0;
const nextLocalId = () => `q-${Date.now()}-${localIdCounter++}`;

function emptyChoiceOptions() {
  return [
    { id: nextLocalId(), label: "" },
    { id: nextLocalId(), label: "" },
  ];
}

// Defaults per type, keyed to the working (pre-payload-mapping) shape a
// QuestionCard edits directly. Mapped to the real API payload
// (content_payload / grading_rubric) only at submit time — see
// buildQuestionPayload below.
function createQuestion(questionType = QUESTION_TYPES.MCQ) {
  const base = {
    localId: nextLocalId(),
    question_type: questionType,
    points: 1,
    prompt: "",
  };

  switch (questionType) {
    case QUESTION_TYPES.TRUE_FALSE:
      return {
        ...base,
        options: [
          { id: "true", label: "True" },
          { id: "false", label: "False" },
        ],
        correctOptionId: "true",
        explanation: "",
      };
    case QUESTION_TYPES.MCQ:
      return { ...base, options: emptyChoiceOptions(), correctOptionId: "", explanation: "" };
    case QUESTION_TYPES.FILL_BLANK:
      return { ...base, acceptableAnswersText: "", caseSensitive: false };
    case QUESTION_TYPES.SENTENCE_FORMATION:
      return { ...base, sentenceText: "" };
    case QUESTION_TYPES.COMPREHENSION:
      return { ...base, passage: "", keywordsText: "", minWordCount: 20 };
    case QUESTION_TYPES.PARAGRAPH:
      return { ...base, keywordsText: "", minWordCount: 20 };
    default:
      return base;
  }
}

// Maps one QuestionCard's working state to the exact payload
// backend/services/exerciseEvaluationService.js expects (see that
// file's header comment for the contract per type).
function buildQuestionPayload(question, index) {
  const shared = {
    question_type: question.question_type,
    prompt: question.prompt,
    points: Number(question.points) || 1,
    order_index: index + 1,
  };

  switch (question.question_type) {
    case QUESTION_TYPES.MCQ:
    case QUESTION_TYPES.TRUE_FALSE:
      return {
        ...shared,
        content_payload: {
          options: question.options.map((option) => ({ id: option.id, label: option.label })),
        },
        grading_rubric: {
          correct_option_id: question.correctOptionId,
          explanation: question.explanation || undefined,
        },
      };
    case QUESTION_TYPES.FILL_BLANK: {
      const acceptableAnswers = (question.acceptableAnswersText || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return {
        ...shared,
        // case_sensitive is stored for reference only — the backend
        // grader always normalizes (trim + lowercase) regardless; there
        // is no case-sensitive grading path yet.
        content_payload: { case_sensitive: question.caseSensitive },
        grading_rubric: { acceptable_answers: acceptableAnswers },
      };
    }
    case QUESTION_TYPES.SENTENCE_FORMATION: {
      const words = (question.sentenceText || "").trim().split(/\s+/).filter(Boolean);
      const orderedTokens = words.map((text, i) => ({ id: `t${i}`, text }));
      // Shuffle a display copy so the mentee doesn't just see the
      // answer in order — expected_order (below) keeps the real order.
      const shuffledTokens = [...orderedTokens];
      for (let i = shuffledTokens.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledTokens[i], shuffledTokens[j]] = [shuffledTokens[j], shuffledTokens[i]];
      }
      return {
        ...shared,
        content_payload: { tokens: shuffledTokens },
        grading_rubric: { expected_order: orderedTokens.map((t) => t.id) },
      };
    }
    case QUESTION_TYPES.COMPREHENSION:
    case QUESTION_TYPES.PARAGRAPH: {
      const keywords = (question.keywordsText || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return {
        ...shared,
        content_payload:
          question.question_type === QUESTION_TYPES.COMPREHENSION
            ? { passage: question.passage || "" }
            : {},
        grading_rubric: {
          keywords,
          min_word_count: Number(question.minWordCount) || 0,
        },
      };
    }
    default:
      return shared;
  }
}

function ChoiceOptionsEditor({ question, onChange }) {
  const updateOption = (optionId, label) => {
    onChange({
      ...question,
      options: question.options.map((o) => (o.id === optionId ? { ...o, label } : o)),
    });
  };

  const addOption = () => {
    onChange({ ...question, options: [...question.options, { id: nextLocalId(), label: "" }] });
  };

  const removeOption = (optionId) => {
    const options = question.options.filter((o) => o.id !== optionId);
    const correctOptionId = question.correctOptionId === optionId ? "" : question.correctOptionId;
    onChange({ ...question, options, correctOptionId });
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500">
        Options — select the radio to mark the correct answer
      </p>
      {question.options.map((option) => (
        <div key={option.id} className="flex items-center gap-2">
          <input
            type="radio"
            name={`correct-${question.localId}`}
            checked={question.correctOptionId === option.id}
            onChange={() => onChange({ ...question, correctOptionId: option.id })}
            className="accent-indigo-600 shrink-0"
          />
          <input
            type="text"
            value={option.label}
            onChange={(e) => updateOption(option.id, e.target.value)}
            placeholder="Option label"
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {question.options.length > 2 && (
            <button
              type="button"
              onClick={() => removeOption(option.id)}
              className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center cursor-pointer shrink-0"
              aria-label="Remove option"
            >
              <Trash2 size={13} className="text-red-600" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addOption}
        className="text-sm text-indigo-600 font-medium hover:text-indigo-700 cursor-pointer"
      >
        + Add Option
      </button>
      <input
        type="text"
        value={question.explanation}
        onChange={(e) => onChange({ ...question, explanation: e.target.value })}
        placeholder="Explanation / feedback (optional)"
        className="w-full border rounded-lg px-3 py-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

function TrueFalseEditor({ question, onChange }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500">Correct answer</p>
      {question.options.map((option) => (
        <label key={option.id} className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name={`correct-${question.localId}`}
            checked={question.correctOptionId === option.id}
            onChange={() => onChange({ ...question, correctOptionId: option.id })}
            className="accent-indigo-600"
          />
          {option.label}
        </label>
      ))}
      <input
        type="text"
        value={question.explanation}
        onChange={(e) => onChange({ ...question, explanation: e.target.value })}
        placeholder="Explanation / feedback (optional)"
        className="w-full border rounded-lg px-3 py-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

function FillBlankEditor({ question, onChange }) {
  return (
    <div className="space-y-2">
      <input
        type="text"
        value={question.acceptableAnswersText}
        onChange={(e) => onChange({ ...question, acceptableAnswersText: e.target.value })}
        placeholder="Acceptable answers, comma-separated (e.g. run, ran, running)"
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <label className="flex items-center gap-2 text-xs text-gray-500">
        <input
          type="checkbox"
          checked={question.caseSensitive}
          onChange={(e) => onChange({ ...question, caseSensitive: e.target.checked })}
        />
        Case-sensitive (not yet enforced by grading — always normalized today)
      </label>
    </div>
  );
}

function SentenceFormationEditor({ question, onChange }) {
  return (
    <input
      type="text"
      value={question.sentenceText}
      onChange={(e) => onChange({ ...question, sentenceText: e.target.value })}
      placeholder="Type the complete, correctly-ordered sentence"
      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  );
}

function OpenResponseEditor({ question, onChange }) {
  return (
    <div className="space-y-2">
      {question.question_type === QUESTION_TYPES.COMPREHENSION && (
        <textarea
          rows={3}
          value={question.passage}
          onChange={(e) => onChange({ ...question, passage: e.target.value })}
          placeholder="Reading passage"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      )}
      <input
        type="text"
        value={question.keywordsText}
        onChange={(e) => onChange({ ...question, keywordsText: e.target.value })}
        placeholder="Required keywords, comma-separated"
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <div>
        <label className="text-xs text-gray-500">Minimum word count</label>
        <input
          type="number"
          min="0"
          value={question.minWordCount}
          onChange={(e) => onChange({ ...question, minWordCount: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}

function QuestionCard({ question, index, isFirst, isLast, onChange, onRemove, onMove, onTypeChange }) {
  return (
    <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/60">
      <div className="flex items-center justify-between mb-3 gap-2">
        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700 shrink-0">
          Question {index + 1}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => onMove(-1)}
            className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Move question up"
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={() => onMove(1)}
            className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Move question down"
          >
            <ArrowDown size={14} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center cursor-pointer"
            aria-label="Remove question"
          >
            <Trash2 size={14} className="text-red-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 mb-3">
        <select
          value={question.question_type}
          onChange={(e) => onTypeChange(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {QUESTION_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 shrink-0">Points</label>
          <input
            type="number"
            min="1"
            value={question.points}
            onChange={(e) => onChange({ ...question, points: e.target.value })}
            className="w-20 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="mb-3">
        <RichTextEditor
          value={question.prompt}
          onChange={(html) => onChange({ ...question, prompt: html })}
        />
      </div>

      {question.question_type === QUESTION_TYPES.MCQ && (
        <ChoiceOptionsEditor question={question} onChange={onChange} />
      )}
      {question.question_type === QUESTION_TYPES.TRUE_FALSE && (
        <TrueFalseEditor question={question} onChange={onChange} />
      )}
      {question.question_type === QUESTION_TYPES.FILL_BLANK && (
        <FillBlankEditor question={question} onChange={onChange} />
      )}
      {question.question_type === QUESTION_TYPES.SENTENCE_FORMATION && (
        <SentenceFormationEditor question={question} onChange={onChange} />
      )}
      {(question.question_type === QUESTION_TYPES.COMPREHENSION ||
        question.question_type === QUESTION_TYPES.PARAGRAPH) && (
        <OpenResponseEditor question={question} onChange={onChange} />
      )}
    </div>
  );
}

// Slide-out drawer for authoring one lesson exercise (metadata + a
// reorderable list of polymorphic questions). Uncontrolled — owns its
// own draft state and only reaches out to the API on submit, mirroring
// SentenceBlockBuilder's "drawer edits a local draft" pattern rather
// than syncing every keystroke to the parent.
function ExerciseBuilderDrawer({ open, lessonId, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [passingPercentage, setPassingPercentage] = useState(70);
  const [questions, setQuestions] = useState([createQuestion()]);
  const [saving, setSaving] = useState(false);

  const resetDraft = () => {
    setTitle("");
    setInstructions("");
    setPassingPercentage(70);
    setQuestions([createQuestion()]);
  };

  const handleClose = () => {
    resetDraft();
    onClose();
  };

  const updateQuestionAt = (index, nextQuestion) => {
    const next = questions.slice();
    next[index] = nextQuestion;
    setQuestions(next);
  };

  const changeQuestionType = (index, questionType) => {
    const next = questions.slice();
    next[index] = { ...createQuestion(questionType), prompt: next[index].prompt, points: next[index].points };
    setQuestions(next);
  };

  const removeQuestionAt = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const moveQuestion = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    const next = questions.slice();
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    setQuestions(next);
  };

  const addQuestion = () => {
    setQuestions([...questions, createQuestion()]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Exercise title is required");
      return;
    }
    if (questions.length === 0) {
      toast.error("Add at least one question");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title,
        instructions,
        passing_percentage: Number(passingPercentage) || 70,
        questions: questions.map((question, index) => buildQuestionPayload(question, index)),
      };

      await createLessonExercise(lessonId, payload);

      toast.success("Exercise created successfully");
      resetDraft();
      onCreated();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create exercise");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormDrawer open={open} title="Add Assessment / Test" onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 text-sm font-medium">Exercise Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Instructions</label>
          <RichTextEditor value={instructions} onChange={setInstructions} />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Passing Score (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={passingPercentage}
            onChange={(e) => setPassingPercentage(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Questions</h3>
            <span className="text-sm text-gray-400">{questions.length} total</span>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => (
              <QuestionCard
                key={question.localId}
                question={question}
                index={index}
                isFirst={index === 0}
                isLast={index === questions.length - 1}
                onChange={(next) => updateQuestionAt(index, next)}
                onRemove={() => removeQuestionAt(index)}
                onMove={(direction) => moveQuestion(index, direction)}
                onTypeChange={(type) => changeQuestionType(index, type)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50 py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer mt-4"
          >
            <Plus size={16} />
            Add Question
          </button>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-3 border rounded-2xl hover:bg-gray-100 transition-all duration-300 cursor-pointer"
          >
            Cancel
          </button>
          <PrimaryButton type="submit" disabled={saving}>
            {saving ? "Saving..." : "Create Exercise"}
          </PrimaryButton>
        </div>
      </form>
    </FormDrawer>
  );
}

export default ExerciseBuilderDrawer;
