import { useEffect, useState } from "react";
import { BookOpen, Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import StatsCard from "../../components/StatsCard";
import SearchInput from "../../components/SearchInput";
import Loader from "../../components/Loader";
import api from "../../services/api";
import { cefrLevels } from "../../utils/cefrLevels";
import FormInput from "../../components/forms/FormInput";
import ConfirmModal from "../../components/ConfirmModal";
import FormTextarea from "../../components/forms/FormTextarea";
import FormSelect from "../../components/forms/FormSelect";
import FormFileInput from "../../components/forms/FormFileInput";
import { API_BASE_URL } from "../../constants/api";
import { ROUTES } from "../../constants/routes";
import { LESSON_TYPES } from "../../constants/lessonConstants";
import { DIFFICULTY_LEVELS } from "../../constants/lessonConstants";
import PrimaryButton from "../../components/common/PrimaryButton";
import FormDrawer from "../../components/common/FormDrawer";
import TagInput from "../../components/common/TagInput";
import PageActions from "../../components/common/PageActions";
import EmptyState from "../../components/common/EmptyState";
import MultiCheckboxSelector from "../../components/forms/MultiCheckboxSelector";
import { LESSON_OUTCOMES } from "../../constants/lessonOutcomes";
import { TARGET_SKILLS } from "../../constants/targetSkills";
import { parseJsonArray } from "../../utils/jsonUtils";

function LessonsPage() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);
  // const [editModal, setEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState("draft");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [lessonOutcomes, setLessonOutcomes] = useState([]);
  const [targetSkills, setTargetSkills] = useState([]);
  const [editLessonOutcomes, setEditLessonOutcomes] = useState([]);
  const [editTargetSkills, setEditTargetSkills] = useState([]);
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
  const fetchLessons = async () => {
    try {
      const response = await api.get(`/lessons?status=${activeTab}`);

      setLessons(response.data.lessons);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load lessons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [activeTab]);

  const filteredLessons = lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(search.toLowerCase()),
  );

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      formData.append("title", data.title);

      formData.append("cefr_level", data.cefr_level);

      formData.append("description", data.description);
      formData.append("lesson_type", data.lesson_type || "sentence_practice");
      formData.append("difficulty_level", data.difficulty_level || "beginner");
      formData.append("estimated_duration", data.estimated_duration);
      formData.append("lesson_outcomes", JSON.stringify(lessonOutcomes));
      formData.append("target_skills", JSON.stringify(targetSkills));
      if (data.thumbnail?.[0]) {
        formData.append("thumbnail", data.thumbnail[0]);
      }

      await api.post("/lessons", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Lesson created successfully");

      reset();

      setPreview(null);
      setShowCreateDrawer(false);
      setLessonOutcomes([]);
      setTargetSkills([]);
      fetchLessons();
    } catch (error) {
      console.error(error);

      toast.error("Failed to create lesson");
    }
  };
  const handleEdit = (lesson) => {
    setSelectedLesson(lesson);
    console.log(lesson);
    resetEditForm({
      title: lesson.title,
      description: lesson.description,
      cefr_level: lesson.cefr_level,
      lesson_type: lesson.lesson_type,
      difficulty_level: lesson.difficulty_level,
      estimated_duration: lesson.estimated_duration,
    });
    setEditLessonOutcomes(parseJsonArray(lesson.lesson_outcomes));
    setEditTargetSkills(parseJsonArray(lesson.target_skills));
    setThumbnailPreview(
      lesson.thumbnail ? `${API_BASE_URL}/${lesson.thumbnail}` : "",
    );
    setShowEditDrawer(true);
  };
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailPreview(URL.createObjectURL(file));
  };
  useEffect(() => {
    return () => {
      if (thumbnailPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  //Edit Lesson Submit Handler

  const onEditSubmit = async (data) => {
    try {
      const formData = new FormData();

      formData.append("title", data.title);

      formData.append("description", data.description);

      formData.append("cefr_level", data.cefr_level);
      formData.append("lesson_type", data.lesson_type);
      formData.append("difficulty_level", data.difficulty_level);
      formData.append("estimated_duration", data.estimated_duration);
      formData.append("lesson_outcomes", JSON.stringify(editLessonOutcomes));
      formData.append("target_skills", JSON.stringify(editTargetSkills));
      if (data.thumbnail?.[0]) {
        formData.append("thumbnail", data.thumbnail[0]);
      }

      await api.put(`/lessons/${selectedLesson.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Lesson updated successfully");
      setShowEditDrawer(false);
      setEditLessonOutcomes([]);
      setEditTargetSkills([]);
      fetchLessons();
    } catch (error) {
      console.error(error);

      toast.error("Failed to update lesson");
    }
  };
  const updateLessonStatus = async (lessonId, lessonStatus) => {
    try {
      await api.patch(`/lessons/${lessonId}/status`, {
        lesson_status: lessonStatus,
      });

      toast.success("Lesson status updated successfully");

      fetchLessons();
    } catch (error) {
      console.error(error);

      toast.error("Failed to update lesson status");
    }
  };
  const handleDelete = async () => {
    try {
      await api.delete(`/lessons/${selectedLesson.id}`);

      toast.success("Lesson deleted successfully");
      setDeleteModal(false);
      fetchLessons();
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to delete lesson");
    }
  };
  return (
    <DashboardLayout>
      <PageHeader
        title="Lessons"
        description="Manage pronunciation lessons and CEFR content"
      />
      <PageActions>
        <PrimaryButton
          onClick={() => {
            reset();
            setLessonOutcomes([]);
            setTargetSkills([]);
            setShowCreateDrawer(true);
          }}
        >
          + Create Lesson
        </PrimaryButton>
      </PageActions>
      {/* <div className="flex justify-end mb-6">
        <PrimaryButton
          onClick={() => {
            reset();
            setShowCreateDrawer(true);
          }}
        >
          + Create Lesson
        </PrimaryButton>
      </div> */}
      <div className="flex flex-wrap gap-3 mb-8">
        {[
          {
            key: "draft",
            label: "Drafts",
          },
          {
            key: "published",
            label: "Published",
          },
          {
            key: "archived",
            label: "Archived",
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
        px-5 py-3 rounded-2xl font-semibold transition-all duration-300 cursor-pointer
        ${
          activeTab === tab.key
            ? "bg-indigo-600 text-white shadow-lg"
            : "bg-white hover:bg-gray-100 border"
        }
      `}
          >
            {tab.label}
            {/* <span className="ml-2 opacity-80 text-sm">
              (
              {
                lessons.filter((lesson) => lesson.lesson_status === tab.key)
                  .length
              }
              )
            </span> */}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <StatsCard
            title="Total Lessons"
            value={loading ? "..." : lessons.length}
            icon={BookOpen}
          />

          <div className="bg-white rounded-3xl shadow-sm p-6">
            <div className="mb-6">
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lessons..."
              />
            </div>

            {loading ? (
              <Loader text="Loading lessons..." />
            ) : filteredLessons.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No lessons found"
                description="Try adjusting your search or create a new lesson."
                buttonText="Create Lesson"
                onButtonClick={() => {
                  reset();
                  setShowCreateDrawer(true);
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                {filteredLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() =>
                      navigate(`${ROUTES.MENTOR_LESSONS}/${lesson.id}`)
                    }
                    className="bg-gray-50 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      {lesson.thumbnail ? (
                        <img
                          src={`${API_BASE_URL}/${lesson.thumbnail}`}
                          alt={lesson.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={48} className="text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold text-gray-800">
                          {lesson.title}
                        </h2>

                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold">
                          {lesson.cefr_level}
                        </span>
                        <span
                          className={`
    px-3 py-1 rounded-xl text-sm font-semibold
    ${
      lesson.lesson_status === "published"
        ? "bg-green-100 text-green-700"
        : lesson.lesson_status === "archived"
          ? "bg-gray-200 text-gray-700"
          : "bg-yellow-100 text-yellow-700"
    }
  `}
                        >
                          {lesson.lesson_status}
                        </span>
                      </div>

                      <p className="text-gray-600 leading-7 line-clamp-3">
                        {lesson.description || "No description"}
                      </p>
                    </div>
                    {lesson.lesson_status === "draft" && (
                      <div className="flex flex-col sm:flex-row gap-3 mt-4 mb-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            handleEdit(lesson);
                          }}
                          className="w-full sm:w-10 h-10 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 cursor-pointer"
                        >
                          <Pencil size={18} className="text-blue-600" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            updateLessonStatus(lesson.id, "published");
                          }}
                          className="flex-1 px-4 py-2 rounded-xl bg-green-100 hover:bg-green-200 text-green-700 font-semibold transition-all duration-300 cursor-pointer"
                        >
                          Publish
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLesson(lesson);
                            setDeleteModal(true);
                          }}
                          className="w-full sm:w-10 h-10 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 cursor-pointer"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    )}
                    {lesson.lesson_status === "published" && (
                      <div className="flex flex-col sm:flex-row gap-3 mt-4 mb-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            updateLessonStatus(lesson.id, "archived");
                          }}
                          className="flex-1 px-4 py-2 rounded-xl  bg-red-100 hover:bg-red-200 font-semibold transition-all duration-300 cursor-pointer"
                        >
                          Archive
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={deleteModal}
        title="Delete Lesson"
        message="Are you sure you want to delete this lesson?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(false)}
      />
      <FormDrawer
        open={showCreateDrawer}
        title="Create Lesson"
        onClose={() => setShowCreateDrawer(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <FormInput
              label="Lesson Title"
              register={register}
              name="title"
              errors={errors}
              validation={{
                required: "Lesson title is required",
              }}
            />
          </div>
          <div className="mb-4">
            <FormSelect
              label="CEFR Level"
              register={register}
              name="cefr_level"
              errors={errors}
              options={cefrLevels.map((level) => ({
                label: level,
                value: level,
              }))}
              optionLabel="label"
              optionValue="value"
              placeholder="Select CEFR Level"
            />
          </div>
          <div className="mb-4">
            <FormTextarea
              label="Description"
              register={register}
              name="description"
              errors={errors}
              rows={5}
            />
          </div>
          <div className="mb-4">
            <FormSelect
              label="Lesson Type"
              options={LESSON_TYPES}
              register={register}
              name="lesson_type"
            />
          </div>
          <div className="mb-4">
            <FormSelect
              label="Difficulty Level"
              options={DIFFICULTY_LEVELS}
              register={register}
              name="difficulty_level"
            />
          </div>
          <div className="mb-4">
            <FormInput
              label="Estimated Duration (Minutes)"
              type="number"
              register={register}
              name="estimated_duration"
            />
          </div>
          <div className="mb-4">
            <MultiCheckboxSelector
              label="Lesson Outcomes"
              options={LESSON_OUTCOMES}
              selectedValues={lessonOutcomes}
              setSelectedValues={setLessonOutcomes}
            />
          </div>
          <div className="mb-4">
            <MultiCheckboxSelector
              label="Target Skills"
              options={TARGET_SKILLS}
              selectedValues={targetSkills}
              setSelectedValues={setTargetSkills}
            />
          </div>
          <div className="mb-4">
            <FormFileInput
              label="Thumbnail"
              register={register}
              name="thumbnail"
              accept="image/*"
              onFileChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setPreview(URL.createObjectURL(file));
                }
              }}
            />

            {preview && (
              <div className="rounded-2xl overflow-hidden border mt-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer"
          >
            Create Lesson
          </button>
        </form>
      </FormDrawer>
      // Edit Lesson Drawer
      <FormDrawer
        open={showEditDrawer}
        title="Edit Lesson"
        onClose={() => setShowEditDrawer(false)}
      >
        <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-5">
          <div className="mb-4">
            <FormInput
              label="Lesson Title"
              register={editRegister}
              name="title"
              errors={editErrors}
              validation={{
                required: "Title is required",
              }}
            />
          </div>
          <div className="mb-4">
            <FormSelect
              label="CEFR Level"
              register={editRegister}
              name="cefr_level"
              errors={editErrors}
              options={cefrLevels.map((level) => ({
                label: level,
                value: level,
              }))}
              optionLabel="label"
              optionValue="value"
              placeholder="Select CEFR Level"
            />
          </div>
          <div className="mb-4">
            <FormTextarea
              label="Description"
              register={editRegister}
              name="description"
              errors={editErrors}
              rows={5}
            />
          </div>
          <div className="mb-4">
            <FormSelect
              label="Lesson Type"
              options={LESSON_TYPES}
              register={editRegister}
              name="lesson_type"
              errors={editErrors}
            />
          </div>
          <div className="mb-4">
            <FormSelect
              label="Difficulty Level"
              options={DIFFICULTY_LEVELS}
              register={editRegister}
              name="difficulty_level"
              errors={editErrors}
            />
          </div>
          <div className="mb-4">
            <FormInput
              label="Estimated Duration (Minutes)"
              type="number"
              register={editRegister}
              name="estimated_duration"
              errors={editErrors}
            />
          </div>
          <div className="mb-4">
            {/* <FormInput
              label="Lesson Outcomes"
              register={editRegister}
              name="lesson_outcomes"
              errors={editErrors}
              placeholder='E.g. ["Improve pronunciation of "th" sound", "Increase awareness of intonation patterns"]'
            /> */}
            <MultiCheckboxSelector
              label="Lesson Outcomes"
              options={LESSON_OUTCOMES}
              selectedValues={editLessonOutcomes}
              setSelectedValues={setEditLessonOutcomes}
            />
          </div>
          <div className="mb-4">
            {/* <FormInput
              label="Target Skills"
              register={editRegister}
              name="target_skills"
              errors={editErrors}
              placeholder='E.g. ["Pronunciation", "Listening"]'
            /> */}
            <MultiCheckboxSelector
              label="Target Skills"
              options={TARGET_SKILLS}
              selectedValues={editTargetSkills}
              setSelectedValues={setEditTargetSkills}
            />
          </div>
          <div className="mb-4">
            <FormFileInput
              label="Thumbnail"
              register={editRegister}
              name="thumbnail"
              accept="image/*"
              onFileChange={handleThumbnailChange}
            />

            {thumbnailPreview && (
              <div className="mt-4">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail"
                  className="w-full max-h-[250px] object-cover rounded-2xl"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowEditDrawer(false)}
              className="px-6 py-3 border rounded-2xl hover:bg-gray-100 transition-all duration-300 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 cursor-pointer"
            >
              Update Lesson
            </button>
          </div>
        </form>
      </FormDrawer>
    </DashboardLayout>
  );
}

export default LessonsPage;
