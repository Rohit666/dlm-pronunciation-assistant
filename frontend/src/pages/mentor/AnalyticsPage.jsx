import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import Loader from "../../components/Loader";
import CardGrid from "../../components/cards/CardGrid";
import EntityCard from "../../components/cards/EntityCard";
import {
  getWeakStudents,
  getInactiveStudents,
  getLessonEffectiveness,
  getWeakOutcomes,
  getMostImprovedStudents,
} from "../../services/analyticsService";
import { formatDate } from "../../utils/dateUtils";
import OUTCOME_LABELS from "../../constants/outcomeLabels";
function AnalyticsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inactiveStudents, setInactiveStudents] = useState([]);
  const [lessonEffectiveness, setLessonEffectiveness] = useState([]);
  const [weakOutcomes, setWeakOutcomes] = useState([]);
  const [improvedStudents, setImprovedStudents] = useState([]);
  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [
        weakResponse,
        inactiveResponse,
        lessonResponse,
        outcomeResponse,
        improvementResponse,
      ] = await Promise.all([
        getWeakStudents(),
        getInactiveStudents(),
        getLessonEffectiveness(),
        getWeakOutcomes(),
        getMostImprovedStudents(),
      ]);
      setStudents(weakResponse.students);
      setInactiveStudents(inactiveResponse.students);
      setLessonEffectiveness(lessonResponse.lessons);
      setWeakOutcomes(outcomeResponse.outcomes);
      setImprovedStudents(improvementResponse.students);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Analytics"
        description="Student performance insights"
      />

      {loading ? (
        <Loader />
      ) : (
        <div>
          <h2
            className="
    text-2xl
    font-bold
    mt-12
    mb-6
  "
          >
            Weak Students
          </h2>
          <CardGrid>
            {students.map((student) => (
              <EntityCard
                key={student.menteeId}
                title={student.name}
                subtitle={student.email}
                score={student.averageScore}
                badgeCount={student.attempts}
                badgeLabel="Attempts"
                status="Needs Attention"
                statusColor="red"
              />
            ))}
          </CardGrid>
          <h2
            className="
    text-2xl
    font-bold
    mt-12
    mb-6
  "
          >
            Inactive Students
          </h2>

          <CardGrid>
            {inactiveStudents.map((student) => (
              <EntityCard
                key={student.menteeId}
                title={student.name}
                subtitle={student.email}
                badgeCount={student.daysInactive}
                badgeLabel="Days"
                status="Inactive"
                statusColor="red"
                footer={
                  <p
                    className="
              text-sm
              text-gray-500
            "
                  >
                    Last Practice:{" "}
                    {student.lastPracticeDate
                      ? formatDate(student.lastPracticeDate)
                      : "Never"}
                  </p>
                }
              />
            ))}
          </CardGrid>
          <h2
            className="
    text-2xl
    font-bold
    mt-12
    mb-6
  "
          >
            Lesson Effectiveness
          </h2>

          <CardGrid>
            {lessonEffectiveness.map((lesson) => (
              <EntityCard
                key={lesson.lessonId}
                title={lesson.title}
                score={lesson.averageScore}
                badgeCount={lesson.attempts}
                badgeLabel="Attempts"
                status={
                  lesson.averageScore < 60
                    ? "Needs Improvement"
                    : "Performing Well"
                }
                statusColor={lesson.averageScore < 60 ? "red" : "green"}
              />
            ))}
          </CardGrid>
          <h2
            className="
    text-2xl
    font-bold
    mt-12
    mb-6
  "
          >
            Weak Outcomes
          </h2>

          <CardGrid>
            {weakOutcomes.map((outcome) => (
              <EntityCard
                key={outcome.outcome}
                title={OUTCOME_LABELS[outcome.outcome] || outcome.outcome}
                score={outcome.averageScore}
                badgeCount={outcome.attemptCount}
                badgeLabel="Attempts"
                status={outcome.averageScore < 60 ? "Needs Focus" : "Improving"}
                statusColor={outcome.averageScore < 60 ? "red" : "yellow"}
              />
            ))}
          </CardGrid>
          <h2
            className="
    text-2xl
    font-bold
    mt-12
    mb-6
  "
          >
            Most Improved Students
          </h2>

          <CardGrid>
            {improvedStudents.map((student) => (
              <EntityCard
                key={student.menteeId}
                title={student.name}
                subtitle={student.email}
                score={student.latestScore}
                badgeCount={student.improvement}
                badgeLabel="Improved"
                status="Growing"
                statusColor="green"
                footer={
                  <p
                    className="
              text-sm
              text-gray-500
            "
                  >
                    {student.firstScore}
                    {" → "}
                    {student.latestScore}
                  </p>
                }
              />
            ))}
          </CardGrid>
        </div>
      )}
    </DashboardLayout>
  );
}

export default AnalyticsPage;
