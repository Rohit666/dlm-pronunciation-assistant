import { useEffect, useState } from "react";
import { History, PlayCircle, ClipboardCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import { API_BASE_URL } from "../../constants/api";
import PageHeader from "../../components/PageHeader";
import StatsCard from "../../components/StatsCard";
import DataTable from "../../components/DataTable";
import Loader from "../../components/Loader";
import api from "../../services/api";
import { getMyAttempts } from "../../services/reviewServce";
import {
  getMenteeAssessmentAttempts,
  getMenteeAttemptDetail,
} from "../../services/exerciseService";
import AttemptReportDrawer from "../../features/exercises/AttemptReportDrawer";
import EntityCard from "../../components/cards/EntityCard";
import CardGrid from "../../components/cards/CardGrid";
import { ROUTES } from "../../constants/routes";
import { formatDate } from "../../utils/dateUtils";

const TABS = [
  { key: "practice", label: "Practice Sessions", icon: History },
  { key: "assessments", label: "Assessment Attempts", icon: ClipboardCheck },
];

function StatusPill({ passed }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        passed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      {passed ? "Passed" : "Failed"}
    </span>
  );
}

// Comprehensive Assessment History Hub (mentee half) — a second tab on
// this same page (the spec offered either a new dashboard section or a
// tab in here; a tab avoids a whole extra route + nav entry for one
// table) listing every assessment attempt across every lesson, with a
// "View Report Card" action that reuses the exact same Diagnostic
// Report Card AssessmentPlayerPage shows right after a live submit —
// see ReportCard.jsx.
function AssessmentAttemptsTab() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerData, setDrawerData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMenteeAssessmentAttempts();
        setAttempts(data || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load assessment attempts");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openReportCard = async (attempt) => {
    setDrawerOpen(true);
    setDrawerLoading(true);
    try {
      const data = await getMenteeAttemptDetail(attempt.id);
      setDrawerData(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load report card");
      setDrawerOpen(false);
    } finally {
      setDrawerLoading(false);
    }
  };

  const columns = [
    {
      key: "title",
      label: "Assessment",
      render: (a) => a.LessonExercise?.title || "—",
    },
    {
      key: "lesson",
      label: "Lesson",
      render: (a) => a.LessonExercise?.Lesson?.title || "—",
    },
    { key: "attempt_number", label: "Attempt #" },
    {
      key: "percentage",
      label: "Score",
      render: (a) => `${Number(a.percentage)}%`,
    },
    { key: "passed", label: "Status", render: (a) => <StatusPill passed={a.passed} /> },
    {
      key: "submitted_at",
      label: "Submitted",
      render: (a) => formatDate(a.submitted_at),
    },
    {
      key: "action",
      label: "",
      render: (a) => (
        <button
          type="button"
          onClick={() => openReportCard(a)}
          className="text-indigo-600 font-semibold text-sm hover:underline cursor-pointer"
        >
          View Report Card
        </button>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">
      <DataTable
        columns={columns}
        data={attempts}
        loading={loading}
        emptyMessage="No assessment attempts yet."
      />

      <AttemptReportDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        loading={drawerLoading}
        exercise={drawerData?.exercise}
        attempt={drawerData?.attempt}
        answerSheet={drawerData?.answerSheet}
      />
    </div>
  );
}

function PracticeHistoryPage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("practice");
  const navigate = useNavigate();
  const fetchHistory = async () => {
    try {
      const response = await getMyAttempts();
      setAttempts(response.attempts);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <DashboardLayout>
      <PageHeader
        title="Practice History"
        description="Review your pronunciation attempts and assessment results"
      />

      <div className="flex items-center gap-2 mb-8 border-b">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 -mb-px transition-all duration-200 cursor-pointer ${
                activeTab === tab.key
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "practice" && (
        <>
          <div className="mb-8">
            <StatsCard
              title="Total Attempts"
              value={loading ? "..." : attempts.length}
              icon={History}
            />
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-6">
            {loading ? (
              <Loader text="Loading practice history..." />
            ) : (
              <CardGrid>
                {attempts.map((attempt) => (
                  <EntityCard
                    key={attempt.id}
                    thumbnail={
                      attempt?.Lesson?.thumbnail
                        ? `${API_BASE_URL}/${attempt.Lesson.thumbnail}`
                        : null
                    }
                    title={attempt?.Lesson?.title}
                    subtitle={`Attempt #${attempt.attempt_number}`}
                    date={formatDate(attempt.created_at)}
                    score={attempt.overall_score}
                    status={
                      attempt.review_status === "reviewed" ? "Reviewed" : "Pending"
                    }
                    statusColor={
                      attempt.review_status === "reviewed" ? "green" : "yellow"
                    }
                    actionText="View Result"
                    onAction={() =>
                      navigate(`${ROUTES.MENTEE_HISTORY}/${attempt.id}`)
                    }
                  />
                ))}
              </CardGrid>
            )}
          </div>
        </>
      )}

      {activeTab === "assessments" && <AssessmentAttemptsTab />}
    </DashboardLayout>
  );
}

export default PracticeHistoryPage;
