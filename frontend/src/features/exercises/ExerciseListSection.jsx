import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, ChevronRight } from "lucide-react";
import { getLessonExercises } from "../../services/exerciseService";
import { ROUTES } from "../../constants/routes";

// Mounted on the mentee lesson-overview page (LessonPracticePage.jsx),
// alongside the sentence-practice content — exercises are a parallel,
// retakable quiz modality, not part of the pronunciation recording flow.
//
// Navigates to the full-width AssessmentPlayerPage route rather than
// opening ExercisePlayerModal — that modal is deprecated (kept in the
// repo only as prior art / a rollback reference, no longer imported).
function ExerciseListSection({ lessonId }) {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getLessonExercises(lessonId);
        if (!cancelled) setExercises(data);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  if (loading || exercises.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Exercises</h3>
      <div className="space-y-3">
        {exercises.map((exercise) => (
          <button
            key={exercise.id}
            type="button"
            onClick={() => navigate(ROUTES.assessmentPlayer(lessonId, exercise.id))}
            className="w-full flex items-center justify-between border rounded-2xl px-5 py-4 hover:bg-gray-50 transition-all duration-300 cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <ClipboardList size={18} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{exercise.title}</p>
                <p className="text-sm text-gray-500">
                  {(exercise.questions || []).length} question
                  {(exercise.questions || []).length === 1 ? "" : "s"} · Pass at{" "}
                  {exercise.passing_percentage}%
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default ExerciseListSection;
