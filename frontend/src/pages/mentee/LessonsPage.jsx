import { useEffect, useState } from "react";

import { BookOpen, Image as ImageIcon } from "lucide-react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import DashboardLayout from "../../layouts/DashboardLayout";

import PageHeader from "../../components/PageHeader";

import SearchInput from "../../components/SearchInput";
import { API_BASE_URL } from "../../constants/api";
import StatsCard from "../../components/StatsCard";
import Loader from "../../components/Loader";
import api from "../../services/api";
import { ROUTES } from "../../constants/routes";
import { cefrLevels } from "../../utils/cefrLevels";

function LessonsPage() {
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [selectedLevel, setSelectedLevel] = useState("");

  const fetchLessons = async () => {
    try {
      const response = await await api.get(`/lessons?status=published`);

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
  }, []);

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = lesson.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesLevel = selectedLevel
      ? lesson.cefr_level === selectedLevel
      : true;

    return matchesSearch && matchesLevel;
  });

  return (
    <DashboardLayout>
      <PageHeader
        title="Practice Lessons"
        description="Practice pronunciation using interactive multimedia lessons"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Available Lessons"
          value={loading ? "..." : lessons.length}
          icon={BookOpen}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lessons..."
          />

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">All CEFR Levels</option>

            {cefrLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl shadow-sm">
          <Loader text="Loading lessons..." />
        </div>
      ) : filteredLessons.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm p-12 text-center text-gray-400">
          No lessons found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => navigate(`${ROUTES.MENTEE_LESSONS}/${lesson.id}`)}
              className="bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="h-56 bg-gray-100 overflow-hidden">
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {lesson.title}
                  </h2>

                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold">
                    {lesson.cefr_level}
                  </span>
                </div>

                <p className="text-gray-600 leading-7 line-clamp-3">
                  {lesson.description || "No description"}
                </p>

                <button className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl font-semibold transition-all duration-300 cursor-pointer">
                  Expolre Lesson
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default LessonsPage;
