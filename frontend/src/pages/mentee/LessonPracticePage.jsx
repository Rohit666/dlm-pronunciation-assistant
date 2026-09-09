import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { Mic, PlayCircle, ArrowLeft } from "lucide-react";

import toast from "react-hot-toast";

import DashboardLayout from "../../layouts/DashboardLayout";
import { API_BASE_URL } from "../../constants/api";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";
import api from "../../services/api";
import { Upload, Square } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import {
  startPracticeAttempt,
  getActiveAttempt,
} from "../../services/practiceAttemptService";
import PrimaryButton from "../../components/common/PrimaryButton";
import ExerciseListSection from "../../features/exercises/ExerciseListSection";
function LessonPracticePage() {
  const { lessonId } = useParams();
  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState(null);
  const [activeAttempt, setActiveAttempt] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [lessonResponse, sentenceResponse, attemptResponse] =
        await Promise.all([
          api.get(`/lessons/${lessonId}`),
          api.get(`/lesson-sentences/${lessonId}`),
          getActiveAttempt(lessonId),
        ]);

      setLesson(lessonResponse.data.lesson);

      setSentences(sentenceResponse.data.sentences);

      setActiveAttempt(attemptResponse.attempt);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load lesson");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lessonId]);
  const handleStartPractice = async () => {
    try {
      const response = await startPracticeAttempt(lessonId);
      navigate(
        `${ROUTES.MENTEE_PRACTICE}/${lessonId}/player/${response.attemptId}`,
      );
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <DashboardLayout>
      <PageHeader
        title="Lesson Practice"
        description="Practice pronunciation sentence by sentence"
      />
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => navigate(ROUTES.MENTEE_LESSONS)} className="...">
          ← Back to Lessons
        </button>
        <PrimaryButton
          onClick={() => {
            if (activeAttempt) {
              navigate(
                `${ROUTES.MENTEE_PRACTICE}/${lessonId}/player/${activeAttempt.id}`,
              );
            } else {
              handleStartPractice();
            }
          }}
        >
          {activeAttempt ? "Resume Practice" : "Start Practice"}
        </PrimaryButton>
      </div>
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-bold">{lesson?.lesson_name}</h2>

        <p className="text-gray-500 mt-2">
          {lesson?.description || "No description"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="border rounded-2xl p-4">
            <p className="text-gray-500 text-sm">Sentences</p>

            <p className="text-2xl font-bold">{sentences.length}</p>
          </div>

          <div className="border rounded-2xl p-4">
            <p className="text-gray-500 text-sm">Images / Videos</p>

            <p className="text-2xl font-bold">
              {sentences.filter((s) => s.image_path || s.video_path).length}
            </p>
          </div>

          <div className="border rounded-2xl p-4">
            <p className="text-gray-500 text-sm">Estimated Duration</p>

            <p className="text-2xl font-bold">
              {Math.max(1, Math.ceil(sentences.length / 4))} min
            </p>
          </div>
        </div>
      </div>

      <ExerciseListSection lessonId={lessonId} />

      {loading ? (
        <div className="bg-white rounded-3xl shadow-sm">
          <Loader text="Loading lesson content..." />
        </div>
      ) : sentences.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm p-12 text-center text-gray-400">
          No sentences found
        </div>
      ) : (
        <div className="space-y-8">
          {sentences.map((sentence) => (
            <div
              key={sentence.id}
              className="bg-white rounded-3xl shadow-sm overflow-hidden"
            >
              {/* Multimedia Section */}
              {(sentence.image_path || sentence.video_path) && (
                <div className="p-6 pb-0">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Image */}
                    {sentence.image_path && (
                      <div className="bg-gray-100 rounded-3xl overflow-hidden border">
                        <img
                          src={`${API_BASE_URL}/${sentence.image_path}`}
                          alt="Sentence"
                          className="w-full h-[320px] object-cover"
                        />
                      </div>
                    )}

                    {/* Video */}
                    {sentence.video_path && (
                      <div className="bg-black rounded-3xl overflow-hidden border">
                        <video
                          controls
                          className="w-full h-[320px] object-cover"
                        >
                          <source
                            src={`${API_BASE_URL}/${sentence.video_path}`}
                          />
                        </video>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="p-6 md:p-8">
                {/* Sentence Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      {sentence.sentence_order}
                    </div>

                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-8 md:leading-10">
                        {sentence.sentence_text}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Audio */}
                {sentence.audio_path && (
                  <div className="mb-mb-6 bg-gray-50 rounded-3xl p-5 border">
                    <div className="flex items-center gap-3 mb-3">
                      <PlayCircle className="text-indigo-600" />

                      <h3 className="font-semibold text-gray-700">Listen</h3>
                    </div>

                    <audio controls className="w-full">
                      <source src={`${API_BASE_URL}/${sentence.audio_path}`} />
                    </audio>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="bg-white rounded-3xl shadow-sm p-8 mt-8 text-center">
            <h3 className="text-2xl font-bold">Ready to begin?</h3>

            <p className="text-gray-500 mt-2">
              Practice all {sentences.length} lesson sentences
            </p>

            {/* <button
              onClick={() =>
                navigate(`${ROUTES.MENTEE_PRACTICE}/${lessonId}/player`)
              }
              className="
      mt-6
      bg-indigo-600
      text-white
      px-8 py-4
      rounded-xl
      hover:bg-indigo-700
      transition-all
    "
            >
              Start Practice
            </button> */}
            <PrimaryButton
              onClick={() => {
                if (activeAttempt) {
                  navigate(
                    `${ROUTES.MENTEE_PRACTICE}/${lessonId}/player/${activeAttempt.id}`,
                  );
                } else {
                  handleStartPractice();
                }
              }}
            >
              {activeAttempt ? "Resume Practice" : "Start Practice"}
            </PrimaryButton>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default LessonPracticePage;
