import { useEffect, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import StatsCard from "../../components/StatsCard";
import EntityCard from "../../components/cards/EntityCard";
import CardGrid from "../../components/cards/CardGrid";
import Loader from "../../components/Loader";
import { API_BASE_URL } from "../../constants/api";
import api from "../../services/api";
import { getReviewAttempts } from "../../services/reviewServce";
import { ROUTES } from "../../constants/routes";
import { formatDate } from "../../utils/dateUtils";

function ReviewsList() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();

  const fetchReviews = async () => {
    try {
      const response = await getReviewAttempts();
      setAttempts(response.attempts);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <DashboardLayout>
      <PageHeader
        title="Practice Reviews"
        description="Review pronunciation attempts from mentees"
      />

      <div className="mb-8">
        <StatsCard
          title="Practice Attempts"
          value={loading ? "..." : attempts.length}
          icon={ClipboardCheck}
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl shadow-sm">
          <Loader text="Loading practice reviews..." />
        </div>
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
              title={attempt?.Mentee?.User?.name}
              subtitle={`Attempt #${attempt.attempt_number}`}
              status="Pending Review"
              statusColor="yellow"
              date={formatDate(attempt.created_at)}
              actionText="Review"
              onAction={() =>
                navigate(`${ROUTES.MENTOR_REVIEWS}/${attempt.id}`)
              }
            >
              <p className="text-sm text-gray-500">{attempt?.Lesson?.title}</p>
              <p className="text-sm text-gray-500 mt-1">
                {attempt?.Mentee?.User?.email}
              </p>
            </EntityCard>
          ))}
        </CardGrid>
      )}
    </DashboardLayout>
  );
}

export default ReviewsList;
