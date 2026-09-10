import { useEffect, useState } from "react";

import { Plus, FileText, ClipboardList, GitBranch } from "lucide-react";

import { useParams } from "react-router-dom";

import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { ArrowLeft } from "lucide-react";
import api from "../../services/api";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { ROUTES } from "../../constants/routes";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import SortableSentenceCard from "../../components/SortableSentenceCard";

import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import ConfirmModal from "../../components/ConfirmModal";
import FormDrawer from "../../components/common/FormDrawer";
import SentenceBlockBuilder from "../../components/mentor/SentenceBlockBuilder";
import {
  defaultBlocks,
  blocksFromSentence,
  appendBlocksToFormData,
} from "../../utils/sentenceBlocks";
import { API_BASE_URL } from "../../constants/api";
import ExerciseBuilderDrawer from "../../features/exercises/mentor/ExerciseBuilderDrawer";
import ExerciseCard from "../../features/exercises/mentor/ExerciseCard";
import ExerciseSubmissionsDrawer from "../../features/exercises/mentor/ExerciseSubmissionsDrawer";
import {
  getLessonExercises,
  deleteLessonExercise,
} from "../../services/exerciseService";
import { getCourseTree } from "../../services/courseStreamService";
import TopicTreeExplorer from "../../features/topics/mentor/TopicTreeExplorer";

function LessonDetailPage() {
  const navigate = useNavigate();

  const { lessonId } = useParams();

  // "sentences" | "exercises" | "structure". Sentences/exercises are the
  // original flat tabs (untouched, list everything in the lesson
  // regardless of topic); structure is the Hierarchical Content Tree
  // explorer layered on top — an organizational + creation view, not a
  // replacement for the flat lists.
  const [activeTab, setActiveTab] = useState("sentences");

  const [tree, setTree] = useState(null);

  const [sentences, setSentences] = useState([]);

  const [loading, setLoading] = useState(true);

  const [deleteModal, setDeleteModal] = useState(false);

  const [selectedSentence, setSelectedSentence] = useState(null);

  const [exercises, setExercises] = useState([]);
  const [exercisesLoading, setExercisesLoading] = useState(true);
  const [exerciseDrawerOpen, setExerciseDrawerOpen] = useState(false);
  const [exerciseDrawerTopicId, setExerciseDrawerTopicId] = useState(null);
  const [exerciseDeleteModal, setExerciseDeleteModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  // Comprehensive Assessment History Hubs (mentor half) — the exercise
  // whose "Submissions" drawer is open, or null when closed.
  const [submissionsExercise, setSubmissionsExercise] = useState(null);

  // Single shared drawer (Create + Edit) — see SentenceBlockBuilder for
  // the block editor itself. drawerMode picks which endpoint submit
  // hits; drawerBlocks/drawerOrder are the drawer's own controlled
  // state, reused for both modes. drawerTopicId is set only when the
  // Tree Explorer's "+ Content" opens this drawer scoped to a topic —
  // null means course root (and is always null when editing, since
  // moving existing content between topics isn't wired into this drawer).
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("create");
  const [drawerBlocks, setDrawerBlocks] = useState(defaultBlocks());
  const [drawerOrder, setDrawerOrder] = useState(1);
  const [drawerTopicId, setDrawerTopicId] = useState(null);
  const [drawerSaving, setDrawerSaving] = useState(false);

  const fetchSentences = async () => {
    try {
      const response = await api.get(`/lesson-sentences/${lessonId}`);
      setSentences(response.data.sentences);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load sentences");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentences();
  }, []);

  const fetchExercises = async () => {
    try {
      setExercisesLoading(true);
      const data = await getLessonExercises(lessonId);
      setExercises(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load exercises");
    } finally {
      setExercisesLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchTree = async () => {
    try {
      const data = await getCourseTree(lessonId);
      setTree(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load content structure");
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const handleExerciseCreated = () => {
    setExerciseDrawerOpen(false);
    setExerciseDrawerTopicId(null);
    fetchExercises();
    fetchTree();
  };

  const openAssessmentDrawer = (topicId = null) => {
    setExerciseDrawerTopicId(topicId);
    setExerciseDrawerOpen(true);
  };

  const handleDeleteExercise = async () => {
    try {
      await deleteLessonExercise(selectedExercise.id);
      toast.success("Exercise deleted successfully");
      setExerciseDeleteModal(false);
      setSelectedExercise(null);
      fetchExercises();
      fetchTree();
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };

  const openCreateDrawer = (topicId = null) => {
    setDrawerMode("create");
    setSelectedSentence(null);
    setDrawerBlocks(defaultBlocks());
    setDrawerOrder(sentences.length + 1);
    setDrawerTopicId(topicId);
    setDrawerOpen(true);
  };

  const openEditDrawer = (sentence) => {
    setDrawerMode("edit");
    setSelectedSentence(sentence);
    setDrawerBlocks(blocksFromSentence(sentence, API_BASE_URL));
    setDrawerOrder(sentence.sentence_order);
    setDrawerTopicId(null);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedSentence(null);
    setDrawerTopicId(null);
  };

  const handleDrawerSubmit = async (e) => {
    e.preventDefault();

    if (!drawerOrder) {
      toast.error("Sentence order is required");
      return;
    }

    try {
      setDrawerSaving(true);

      const formData = new FormData();
      formData.append("sentence_order", drawerOrder);
      if (drawerMode === "create" && drawerTopicId) {
        formData.append("topic_id", drawerTopicId);
      }
      appendBlocksToFormData(formData, drawerBlocks);

      if (drawerMode === "create") {
        await api.post(`/lesson-sentences/${lessonId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Sentence added successfully");
      } else {
        await api.put(`/lesson-sentences/${selectedSentence.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Sentence updated successfully");
      }

      closeDrawer();
      fetchSentences();
      fetchTree();
    } catch (error) {
      console.error(error);

      toast.error(
        drawerMode === "create"
          ? "Failed to add sentence"
          : "Failed to update sentence",
      );
    } finally {
      setDrawerSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/lesson-sentences/sentence/${selectedSentence.id}`);

      toast.success("Sentence deleted successfully");

      setDeleteModal(false);

      fetchSentences();
      fetchTree();
    } catch (error) {
      console.error(error);

      toast.error("Delete failed");
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sentences.findIndex(
      (sentence) => sentence.id === active.id,
    );

    const newIndex = sentences.findIndex((sentence) => sentence.id === over.id);

    const updatedSentences = arrayMove(sentences, oldIndex, newIndex).map(
      (sentence, index) => ({
        ...sentence,
        sentence_order: index + 1,
      }),
    );

    setSentences(updatedSentences);

    try {
      await api.put("/lesson-sentences/reorder", {
        sentences: updatedSentences.map((sentence) => ({
          id: sentence.id,

          sentence_order: sentence.sentence_order,
        })),
      });

      toast.success("Sentence order updated");
    } catch (error) {
      console.error(error);

      toast.error("Failed to update order");

      fetchSentences();
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Lesson Sentences"
        description="Manage sentence-level pronunciation content"
      />
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(ROUTES.MENTOR_LESSONS)}
          className="flex items-center gap-2 bg-white hover:bg-gray-100 border px-5 py-3 rounded-2xl transition-all duration-300 cursor-pointer"
        >
          <ArrowLeft size={18} />

          <span>Back to Lessons</span>
        </button>

        {activeTab === "sentences" && (
          <button
            onClick={() => openCreateDrawer()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl transition-all duration-300 cursor-pointer"
          >
            <Plus size={18} />
            Add Sentence
          </button>
        )}
        {activeTab === "exercises" && (
          <button
            onClick={() => openAssessmentDrawer()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl transition-all duration-300 cursor-pointer"
          >
            <Plus size={18} />
            Add Assessment / Test
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-6 bg-white rounded-2xl p-1.5 shadow-sm w-fit">
        <button
          onClick={() => setActiveTab("sentences")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer ${
            activeTab === "sentences"
              ? "bg-indigo-600 text-white"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <FileText size={16} />
          Sentences
        </button>
        <button
          onClick={() => setActiveTab("exercises")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer ${
            activeTab === "exercises"
              ? "bg-indigo-600 text-white"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <ClipboardList size={16} />
          Assessments &amp; Exercises
        </button>
        <button
          onClick={() => setActiveTab("structure")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer ${
            activeTab === "structure"
              ? "bg-indigo-600 text-white"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <GitBranch size={16} />
          Structure
        </button>
      </div>

      {activeTab === "sentences" && (
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Sentences</h2>

            <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-semibold">
              {sentences.length} Total
            </div>
          </div>

          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {!loading && sentences.length === 0 && (
              <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
                <h3 className="text-2xl font-bold text-gray-700 mb-3">
                  No sentences added
                </h3>

                <p className="text-gray-500">
                  Start building pronunciation practice content.
                </p>
              </div>
            )}
            <SortableContext
              items={sentences.map((sentence) => sentence.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-5">
                {sentences.map((sentence) => (
                  <SortableSentenceCard
                    key={sentence.id}
                    sentence={sentence}
                    onEdit={openEditDrawer}
                    onDelete={(s) => {
                      setSelectedSentence(s);
                      setDeleteModal(true);
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {activeTab === "exercises" && (
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Assessments &amp; Exercises</h2>

            <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-semibold">
              {exercises.length} Total
            </div>
          </div>

          {!exercisesLoading && exercises.length === 0 && (
            <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
              <h3 className="text-2xl font-bold text-gray-700 mb-3">
                No assessments added
              </h3>

              <p className="text-gray-500">
                Add a quiz or test to check understanding for this lesson.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onDelete={(ex) => {
                  setSelectedExercise(ex);
                  setExerciseDeleteModal(true);
                }}
                onViewSubmissions={setSubmissionsExercise}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === "structure" && (
        <div className="mt-6">
          <TopicTreeExplorer
            lessonId={lessonId}
            tree={tree}
            onRefresh={fetchTree}
            onOpenContentDrawer={openCreateDrawer}
            onOpenAssessmentDrawer={openAssessmentDrawer}
          />
        </div>
      )}

      <FormDrawer
        open={drawerOpen}
        title={drawerMode === "create" ? "Add Sentence" : "Edit Sentence"}
        onClose={closeDrawer}
      >
        <form onSubmit={handleDrawerSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium">
              Sentence Order
            </label>
            <input
              type="number"
              value={drawerOrder}
              onChange={(e) => setDrawerOrder(Number(e.target.value))}
              required
              className="
                w-full border rounded-xl px-4 py-3
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            />
          </div>

          <SentenceBlockBuilder
            blocks={drawerBlocks}
            onBlocksChange={setDrawerBlocks}
          />

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={closeDrawer}
              className="px-6 py-3 border rounded-2xl hover:bg-gray-100 transition-all duration-300 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={drawerSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {drawerSaving
                ? "Saving..."
                : drawerMode === "create"
                  ? "Add Sentence"
                  : "Update Sentence"}
            </button>
          </div>
        </form>
      </FormDrawer>

      <ConfirmModal
        isOpen={deleteModal}
        title="Delete Sentence"
        message="Are you sure you want to delete this sentence?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(false)}
      />

      <ExerciseBuilderDrawer
        open={exerciseDrawerOpen}
        lessonId={lessonId}
        topicId={exerciseDrawerTopicId}
        onClose={() => {
          setExerciseDrawerOpen(false);
          setExerciseDrawerTopicId(null);
        }}
        onCreated={handleExerciseCreated}
      />

      <ConfirmModal
        isOpen={exerciseDeleteModal}
        title="Delete Assessment"
        message="Are you sure you want to delete this assessment? All questions and student attempt history for it will be permanently removed."
        onConfirm={handleDeleteExercise}
        onCancel={() => setExerciseDeleteModal(false)}
      />

      <ExerciseSubmissionsDrawer
        exercise={submissionsExercise}
        open={!!submissionsExercise}
        onClose={() => setSubmissionsExercise(null)}
      />
    </DashboardLayout>
  );
}

export default LessonDetailPage;
