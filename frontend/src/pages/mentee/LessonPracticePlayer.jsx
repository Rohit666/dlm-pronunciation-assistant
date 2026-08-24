import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { API_BASE_URL } from "../../constants/api";
import useAudioRecorder from "../../hooks/useAudioRecorder";
import PrimaryButton from "../../components/common/PrimaryButton";
import Loader from "../../components/Loader";
import SecondaryButton from "../../components/common/SecondaryButton";
import { formatTime } from "../../utils/timeFormatter";
import PronunciationAssessment from "../../features/assessment/layouts/SuccessAssessment.jsx";
import usePracticePlayer from "../../features/practice/hooks/usePracticePlayer";
import { adaptAssessment } from "../../features/assessment/adapter/assessmentAdapter";
import { getPracticeAttempt } from "../../services/practiceAttemptService";
import { ROUTES } from "../../constants/routes";
function LessonPracticePlayer() {
  const navigate = useNavigate();
  const {
    lesson,
    setLesson,
    sentences,
    setSentences,
    practiceAttempt,
    setPracticeAttempt,
    currentIndex,
    setCurrentIndex,
    loading,
    setLoading,
    assessment,
    setAssessment,
    stage,
    setStage,
    error,
    setError,
    lessonId,
    attemptId,
    setAudioBlob,
  } = usePracticePlayer();
  const referenceAudioRef = useRef(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const recordedAudioRef = useRef(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);

  const [isComparing, setIsComparing] = useState(false);
  const [hasCompared, setHasCompared] = useState(false);
  const player = usePracticePlayer();
  console.log("player", player);
  const {
    isRecording,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    resetRecording,
    recordingTime,
  } = useAudioRecorder();

  const completedCount = practiceAttempt
    ? Math.min(practiceAttempt.current_sentence_order - 1, sentences.length)
    : 0;

  const fetchLessonData = async () => {
    try {
      const [lessonResponse, sentenceResponse] = await Promise.all([
        api.get(`/lessons/${lessonId}`),
        api.get(`/lesson-sentences/${lessonId}`),
      ]);
      setLesson(lessonResponse.data.lesson);
      setSentences(sentenceResponse.data.sentences);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonData();
  }, []);

  useEffect(() => {
    loadAttempt();
  }, [attemptId]);

  const loadAttempt = async () => {
    try {
      const response = await getPracticeAttempt(attemptId);
      setPracticeAttempt(response.attempt);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (practiceAttempt && sentences.length) {
      setCurrentIndex(practiceAttempt.current_sentence_order - 1);
    }
  }, [practiceAttempt, sentences]);
  useEffect(() => {
    const audio = recordedAudioRef.current;
    if (!audio) return;
    const handleEnded = () => {
      setIsPlayingRecording(false);
    };
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const changePlaybackSpeed = (speed) => {
    setPlaybackRate(speed);
    if (referenceAudioRef.current) {
      referenceAudioRef.current.playbackRate = speed;
    }
  };

  useEffect(() => {
    const audio = recordedAudioRef.current;
    if (!audio) return;
    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
    };
    const handleTimeUpdate = () => {
      setCurrentPlaybackTime(audio.currentTime);
    };
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [audioUrl]);

  const progress = practiceAttempt
    ? Math.min(
        ((practiceAttempt.current_sentence_order - 1) / sentences.length) * 100,
        100,
      )
    : 0;

  const [uploading, setUploading] = useState(false);

  console.log({
    currentIndex,
    sentenceCount: sentences.length,
    currentSentence: sentences[currentIndex],
  });

  const currentSentence = sentences[currentIndex];
  if (!currentSentence) {
    return <Loader />;
  }
  const lessonSentenceId = currentSentence.id;

  // Compare
  // const handleCompareRecording = async () => {
  //   if (!audioBlob) return;
  //   try {
  //     setIsComparing(true);
  //     const response = await comparePractice({
  //       lessonSentenceId: currentSentence.id,
  //       practiceAttemptId: attemptId,
  //       audioBlob,
  //     });
  //     setAssessment(adaptAssessment(response.result));
  //     console.log("assessment", response.result);
  //     setHasCompared(true);
  //     // show loading screen
  //     setStage("loading");
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setIsComparing(false);
  //   }
  // };
  const handleCompareRecording = () => {
    if (!audioBlob) {
      return;
    }
    player.setAudioBlob(audioBlob);
    player.setStage("loading");
  };
  // Submit
  // const handleSubmitRecording = async () => {
  //   try {
  //     if (!audioBlob) return;
  //     setUploading(true);
  //     await submitPractice({
  //       lessonSentenceId: currentSentence.id,
  //       practiceAttemptId: attemptId,
  //       audioBlob,
  //     });
  //     if (currentIndex === sentences.length - 1) {
  //       await completePracticeAttempt(attemptId);
  //       navigate(`${ROUTES.MENTEE_PRACTICE}/${lessonId}/complete/${attemptId}`);
  //     } else {
  //       const nextSentenceOrder = currentIndex + 2;
  //       await updatePracticeProgress(attemptId, nextSentenceOrder);
  //       setPracticeAttempt((prev) => ({
  //         ...prev,
  //         current_sentence_order: nextSentenceOrder,
  //       }));
  //       setCurrentIndex((prev) => prev + 1);
  //     }

  //     resetRecording();
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  const playRecording = () => {
    if (recordedAudioRef.current) {
      recordedAudioRef.current.play();
      setIsPlayingRecording(true);
    }
  };
  const stopRecordingPlayback = () => {
    if (recordedAudioRef.current) {
      recordedAudioRef.current.pause();
      recordedAudioRef.current.currentTime = 0;
      setIsPlayingRecording(false);
    }
  };
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  return (
    <div className="max-w-5xl mx-auto">
      <div
        className="
    bg-white
    rounded-3xl
    shadow-sm
    p-6
    mt-5
  "
      >
        <div className="flex items-center justify-between">
          <SecondaryButton
            onClick={() => navigate(`${ROUTES.MENTEE_LESSONS}/${lessonId}`)}
          >
            ← Back
          </SecondaryButton>

          <div className="text-right">
            <div className="font-semibold">
              {completedCount} / {sentences.length}
            </div>

            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <h1 className="text-2xl font-bold">{lesson?.title}</h1>

          <p className="text-gray-500 mt-2">
            Sentence {currentIndex + 1} of {sentences.length}
          </p>
        </div>

        <div className="w-full bg-gray-200 h-3 rounded-full mt-6">
          <div
            className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>
      <div className="bg-white rounded-3xl shadow-sm p-8 mt-6 ">
        <h2
          className="
  text-5xl
  font-bold
  text-center
  mt-8
"
        >
          {currentSentence?.sentence_text}
        </h2>
      </div>
      {currentSentence?.image_path && (
        <div className="bg-white rounded-3xl shadow-sm p-8 mt-6">
          <img
            src={`${API_BASE_URL}/${currentSentence.image_path}`}
            alt=""
            className="
      mx-auto
      rounded-2xl
      max-h-80
      object-contain
      mb-8
    "
          />
        </div>
      )}
      {currentSentence?.video_path && (
        <div className="bg-white rounded-3xl shadow-sm p-8 mt-6">
          <video
            controls
            className="
      mx-auto
      rounded-2xl
      max-h-80
      mb-8
    "
          >
            <source src={`${API_BASE_URL}/${currentSentence.video_path}`} />
          </video>
        </div>
      )}
      {currentSentence?.audio_path && (
        <div
          className="
      bg-white
      rounded-3xl
      shadow-sm
      p-6
      mt-6
    "
        >
          <h3 className="font-semibold mb-4">Reference Audio</h3>

          <audio
            controls
            ref={referenceAudioRef}
            className="w-full"
            key={currentSentence.id}
          >
            <source src={`${API_BASE_URL}/${currentSentence.audio_path}`} />
          </audio>

          <div className="flex gap-2 mt-4 flex-wrap">
            {[0.5, 0.75, 1, 1.25, 1.5].map((speed) => (
              <button
                key={speed}
                onClick={() => changePlaybackSpeed(speed)}
                className={`
              px-3 py-2 rounded-lg border
              ${playbackRate === speed ? "bg-indigo-600 text-white" : ""}
            `}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      )}
      <div
        className="
      bg-white
      rounded-3xl
      shadow-sm
      p-6
      mt-6
    "
      >
        {isRecording && (
          <div
            className="
      bg-red-50
      border
      border-red-200
      rounded-3xl
      p-6
      mt-6
      text-center
    "
          >
            <div
              className="
        w-5
        h-5
        rounded-full
        bg-red-500
        animate-pulse
        mx-auto
      "
            />

            <p className="mt-3 font-semibold">Recording...</p>
            <p className="mt-2 text-sm">{formatTime(recordingTime)}</p>
          </div>
        )}
        {!isRecording ? (
          <div>
            <PrimaryButton onClick={startRecording}>
              Start Recording
            </PrimaryButton>
          </div>
        ) : (
          <div className="mt-4">
            <PrimaryButton
              onClick={() => {
                stopRecording();
                setAssessment(null);
                setHasCompared(false);
              }}
            >
              Stop Recording
            </PrimaryButton>
          </div>
        )}
      </div>

      {audioUrl && (
        <audio controls src={audioUrl} hidden ref={recordedAudioRef} />
      )}
      {audioBlob && (
        <div
          className="
      bg-white
      rounded-3xl
      shadow-sm
      p-6
      mt-6
    "
        >
          <h3 className="font-semibold mb-4">Your Recording</h3>

          <div className="flex gap-3 flex-wrap">
            {!isPlayingRecording ? (
              <SecondaryButton onClick={playRecording}>
                ▶ Play ({formatTime(audioDuration)})
              </SecondaryButton>
            ) : (
              <SecondaryButton onClick={stopRecordingPlayback}>
                ■ Stop ({formatTime(currentPlaybackTime)}/
                {formatTime(audioDuration)})
              </SecondaryButton>
            )}
            <button
              className="
              bg-yellow-400
            text-white px-6 py-3
        rounded-xl
        hover:-translate-y-1
hover:shadow-xl
active:translate-y-0
duration-300   hover:bg-yellow-500  cursor-pointer disabled:opacity-50
        transition-all "
              onClick={handleCompareRecording}
              disabled={!audioBlob || isComparing}
            >
              {isComparing ? "Comparing..." : "Compare"}
            </button>
            {/* <PrimaryButton
              onClick={handleSubmitRecording}
              disabled={uploading || !hasCompared}
            >
              {uploading ? "Uploading..." : "Submit Recording"}
            </PrimaryButton> */}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <SecondaryButton
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(currentIndex - 1)}
        >
          Previous
        </SecondaryButton>

        <PrimaryButton
          disabled={currentIndex === sentences.length - 1}
          onClick={() => setCurrentIndex(currentIndex + 1)}
        >
          Next
        </PrimaryButton>
      </div>
    </div>
  );
}

export default LessonPracticePlayer;
