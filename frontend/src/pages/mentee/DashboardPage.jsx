import { useEffect, useState } from "react";

import { BookOpen, Mic, Layers3, Image as ImageIcon } from "lucide-react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import DashboardLayout from "../../layouts/DashboardLayout";

import PageHeader from "../../components/PageHeader";
import RecommendationSection from "../../components/recommendations/RecommendationSection";
import StatsCard from "../../components/StatsCard";
import CarouselRow from "../../components/carousels/CarouselRow";
import CarouselLessonCard from "../../components/carousels/CarouselLessonCard";
import CefrMilestoneTrack from "../../components/milestones/CefrMilestoneTrack";
import ScoreOverviewCard from "../../components/milestones/ScoreOverviewCard";
import AttemptTrajectoryChart from "../../components/milestones/AttemptTrajectoryChart";
import { API_BASE_URL } from "../../constants/api";
import api from "../../services/api";
import { ROUTES } from "../../constants/routes";
import {
  getDiscoveryCarousels,
  getCefrMilestones,
  getScoreOverview,
  getAttemptTrajectory,
} from "../../services/menteeInsightsService";

function DashboardPage() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const [loading, setLoading] = useState(true);

  // Discovery carousels, CEFR milestones, and score/trajectory widgets.
  // Backed by mock data for now (see services/menteeInsightsService.js)
  // — kept in a separate effect so a failure here never blocks the
  // real dashboard stats/recommendations above.
  const [carousels, setCarousels] = useState(null);
  const [milestones, setMilestones] = useState(null);
  const [scoreOverview, setScoreOverview] = useState(null);
  const [trajectory, setTrajectory] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const [dashboardResponse, recommendationResponse] = await Promise.all([
        api.get("/mentee-dashboard"),

        api.get("/recommendations"),
      ]);
      setDashboardData(dashboardResponse.data);
      setRecommendations(recommendationResponse.data);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const [carouselData, milestoneData, scoreData, trajectoryData] =
        await Promise.all([
          getDiscoveryCarousels(),
          getCefrMilestones(),
          getScoreOverview(),
          getAttemptTrajectory(),
        ]);
      setCarousels(carouselData);
      setMilestones(milestoneData);
      setScoreOverview(scoreData);
      setTrajectory(trajectoryData);
    } catch (error) {
      console.error(error);
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchInsights();
  }, []);

  const openLesson = (lessonId) =>
    navigate(`${ROUTES.MENTEE_PRACTICE}/${lessonId}`);

  return (
    <DashboardLayout>
      <PageHeader
        title="Mentee Dashboard"
        description="Continue your pronunciation learning journey"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Practice Attempts"
          value={loading ? "..." : dashboardData?.stats?.practiceCount || 0}
          icon={Mic}
        />

        <StatsCard
          title="Assigned Batch"
          value={
            loading ? "..." : dashboardData?.mentee?.Batch?.batch_name || "-"
          }
          icon={Layers3}
        />

        <StatsCard
          title="Available Lessons"
          value={loading ? "..." : dashboardData?.lessons?.length || 0}
          icon={BookOpen}
        />
      </div>
      {recommendations && (
        <RecommendationSection
          recommendation={recommendations}
          onContinuePractice={() => navigate(ROUTES.MENTEE_LESSONS)}
          onOpenLesson={openLesson}
        />
      )}

      {/* Progress & Milestones */}
      {!insightsLoading && (
        <div className="mb-10">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <CefrMilestoneTrack milestones={milestones} />
            <ScoreOverviewCard scores={scoreOverview} />
          </div>

          <AttemptTrajectoryChart trajectory={trajectory} />
        </div>
      )}

      {/* Netflix-style discovery carousels */}
      {!insightsLoading && carousels && (
        <div>
          <CarouselRow
            title="Up Next for You"
            subtitle="Lessons matched to your current CEFR level"
            itemCount={carousels.upNext.length}
            emptyMessage="No new lessons queued right now."
          >
            {carousels.upNext.map((lesson) => (
              <CarouselLessonCard
                key={lesson.id}
                lesson={lesson}
                onOpen={openLesson}
              />
            ))}
          </CarouselRow>

          <CarouselRow
            title="Fix Your Weak Sounds"
            subtitle="Lessons targeting your lowest-scoring phonemes"
            itemCount={carousels.weakSounds.length}
            emptyMessage="No weak-sound drills right now — nice work!"
          >
            {carousels.weakSounds.map((lesson) => (
              <CarouselLessonCard
                key={lesson.id}
                lesson={lesson}
                onOpen={openLesson}
                matchReason
              />
            ))}
          </CarouselRow>

          <CarouselRow
            title="Continue Practicing"
            subtitle="Pick up where you left off"
            itemCount={carousels.continuePracticing.length}
            emptyMessage="Nothing in progress — start a lesson below."
          >
            {carousels.continuePracticing.map((lesson) => (
              <CarouselLessonCard
                key={lesson.id}
                lesson={lesson}
                onOpen={openLesson}
              />
            ))}
          </CarouselRow>

          <CarouselRow
            title="My Watchlist"
            subtitle="Lessons you've bookmarked for later"
            itemCount={carousels.watchlist.length}
            emptyMessage="You haven't bookmarked any lessons yet."
          >
            {carousels.watchlist.map((lesson) => (
              <CarouselLessonCard
                key={lesson.id}
                lesson={lesson}
                onOpen={openLesson}
              />
            ))}
          </CarouselRow>
        </div>
      )}

      {/* Lessons */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">📚 Explore Lessons</h2>

          <button
            onClick={() => navigate(ROUTES.MENTEE_LESSONS)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl transition-all duration-300 cursor-pointer"
          >
            View All Lessons
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {dashboardData?.lessons?.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => navigate(ROUTES.MENTEE_LESSONS)}
              className="bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="h-52 bg-gray-100 overflow-hidden">
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
                  <h2 className="text-xl font-bold text-gray-800">
                    {lesson.title}
                  </h2>

                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold">
                    {lesson.cefr_level}
                  </span>
                </div>

                <p className="text-gray-600 leading-7 line-clamp-3">
                  {lesson.description || "No description"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;
