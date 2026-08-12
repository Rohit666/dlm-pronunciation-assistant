import { useEffect, useState } from "react";
import { History, PlayCircle } from "lucide-react";
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
import EntityCard from "../../components/cards/EntityCard";
import CardGrid from "../../components/cards/CardGrid";
import { ROUTES } from "../../constants/routes";
import { formatDate } from "../../utils/dateUtils";

function PracticeHistoryPage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
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
        description="Review your pronunciation attempts"
      />

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
    </DashboardLayout>
  );
}

export default PracticeHistoryPage;
