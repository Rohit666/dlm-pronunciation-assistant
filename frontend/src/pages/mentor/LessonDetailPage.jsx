import { useEffect, useState } from "react";

import { Trash2, Mic, Image as ImageIcon, Video, Pencil } from "lucide-react";

import { useParams } from "react-router-dom";

import { useForm } from "react-hook-form";

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
import { CSS } from "@dnd-kit/utilities";

import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import ConfirmModal from "../../components/ConfirmModal";
import DataTable from "../../components/DataTable";
import FormInput from "../../components/forms/FormInput";
import SentenceBlockBuilder from "../../components/mentor/SentenceBlockBuilder";
import {
  defaultBlocks,
  blocksFromSentence,
  appendBlocksToFormData,
} from "../../utils/sentenceBlocks";
import { API_BASE_URL } from "../../constants/api";

function LessonDetailPage() {
  const navigate = useNavigate();

  const { lessonId } = useParams();

  const [sentences, setSentences] = useState([]);

  const [loading, setLoading] = useState(true);

  const [deleteModal, setDeleteModal] = useState(false);

  const [selectedSentence, setSelectedSentence] = useState(null);
  const [editModal, setEditModal] = useState(false);

  // Part 1 — modular block-based content builder state. The "Add
  // Sentence" panel and "Edit Sentence" modal each own their own block
  // list; SentenceBlockBuilder is a controlled component.
  const [newBlocks, setNewBlocks] = useState(defaultBlocks());
  const [editBlocks, setEditBlocks] = useState(defaultBlocks());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const {
    register: editRegister,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: { errors: editErrors },
  } = useForm();
  const fetchSentences = async () => {
    try {
      const response = await api.get(`/lesson-sentences/${lessonId}`);
      console.log(response.data.sentences);
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

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      formData.append("sentence_order", data.sentence_order);

      appendBlocksToFormData(formData, newBlocks);

      await api.post(`/lesson-sentences/${lessonId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Sentence added successfully");

      reset();
      setNewBlocks(defaultBlocks());

      fetchSentences();
    } catch (error) {
      console.error(error);

      toast.error("Failed to add sentence");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/lesson-sentences/sentence/${selectedSentence.id}`);

      toast.success("Sentence deleted successfully");

      setDeleteModal(false);

      fetchSentences();
    } catch (error) {
      console.error(error);

      toast.error("Delete failed");
    }
  };
  const handleEdit = (sentence) => {
    setSelectedSentence(sentence);

    resetEditForm({
      sentence_order: sentence.sentence_order,
    });

    setEditBlocks(blocksFromSentence(sentence, API_BASE_URL));

    setEditModal(true);
  };
  const onEditSubmit = async (data) => {
    try {
      const formData = new FormData();

      formData.append("sentence_order", data.sentence_order);

      appendBlocksToFormData(formData, editBlocks);

      await api.put(`/lesson-sentences/${selectedSentence.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Sentence updated successfully");

      fetchSentences();
      setSelectedSentence(null);
      setEditModal(false);
    } catch (error) {
      console.error(error);

      toast.error("Failed to update sentence");
    }
  };
  const reorderSentences = async (reorderedSentences) => {
    try {
      const payload = reorderedSentences.map((sentence, index) => ({
        id: sentence.id,

        sentence_order: index + 1,
      }));

      await api.put("/lesson-sentences/reorder", {
        sentences: payload,
      });
    } catch (error) {
      console.error(error);

      toast.error("Failed to reorder sentences");
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
  const columns = [
    {
      key: "sentence_order",
      label: "Order",
    },
    {
      key: "sentence_text",
      label: "Sentence",
    },
    {
      key: "audio",
      label: "Audio",
      render: (sentence) =>
        sentence.audio_path ? (
          <audio
            controls
            className="w-52"
            key={`${sentence.audio_path}-${sentence.updated_at}`}
          >
            <source
              src={`${API_BASE_URL}/${sentence.audio_path}`}
              type="audio/mpeg"
            />
          </audio>
        ) : (
          "-"
        ),
    },
    {
      key: "image",
      label: "Image",
      render: (sentence) =>
        sentence.image_path ? (
          <img
            src={`${API_BASE_URL}/${sentence.image_path}`}
            alt="Sentence"
            className="w-20 h-20 object-cover rounded-2xl border"
          />
        ) : (
          "-"
        ),
    },
    {
      key: "video",
      label: "Video",
      render: (sentence) =>
        sentence.video_path ? (
          <video
            controls
            className="w-40 rounded-2xl"
            key={`${sentence.audio_path}-${sentence.updated_at}`}
          >
            <source src={`${API_BASE_URL}/${sentence.video_path}`} />
          </video>
        ) : (
          "-"
        ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (sentence) => (
        <>
          <button
            onClick={() => handleEdit(sentence)}
            className="w-10 h-10 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 cursor-pointer"
          >
            <Pencil size={18} className="text-blue-600" />
          </button>
          <button
            onClick={() => {
              setSelectedSentence(sentence);

              setDeleteModal(true);
            }}
            className="w-10 h-10 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 cursor-pointer"
          >
            <Trash2 size={18} className="text-red-600" />
          </button>
        </>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Lesson Sentences"
        description="Manage sentence-level pronunciation content"
      />
      <div className="mb-6">
        <button
          onClick={() => navigate(ROUTES.MENTOR_LESSONS)}
          className="flex items-center gap-2 bg-white hover:bg-gray-100 border px-5 py-3 rounded-2xl transition-all duration-300 cursor-pointer"
        >
          <ArrowLeft size={18} />

          <span>Back to Lessons</span>
        </button>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Sentences</h2>

            <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-semibold">
              {sentences.length} Total
            </div>
          </div>

          {/* <DataTable
            columns={columns}
            data={sentences}
            loading={loading}
            emptyMessage="No sentences added"
          /> */}
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
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
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <Mic className="text-indigo-600" />

            <h2 className="text-2xl font-bold">Add Sentence</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormInput
              label="Sentence Order"
              type="number"
              register={register}
              name="sentence_order"
              errors={errors}
              validation={{
                required: "Sentence order is required",
              }}
            />

            <SentenceBlockBuilder blocks={newBlocks} onBlocksChange={setNewBlocks} />

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer"
            >
              Add Sentence
            </button>
          </form>
        </div>
      </div>
      {editModal && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl p-8 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Edit Sentence</h2>

              <button
                onClick={() => setEditModal(false)}
                className="text-gray-500 hover:text-black text-2xl cursor-pointer"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleEditSubmit(onEditSubmit)}
              className="space-y-6"
            >
              <FormInput
                label="Sentence Order"
                type="number"
                register={editRegister}
                name="sentence_order"
                errors={editErrors}
                validation={{
                  required: "Sentence order is required",
                }}
              />

              <SentenceBlockBuilder blocks={editBlocks} onBlocksChange={setEditBlocks} />

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditModal(false)}
                  className="px-6 py-3 border rounded-2xl hover:bg-gray-100 transition-all duration-300 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 cursor-pointer"
                >
                  Update Sentence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={deleteModal}
        title="Delete Sentence"
        message="Are you sure you want to delete this sentence?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(false)}
      />
    </DashboardLayout>
  );
}

export default LessonDetailPage;
