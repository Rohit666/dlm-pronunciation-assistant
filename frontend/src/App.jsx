import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import RouteProgress from "./components/RouteProgress";

import DashboardPage from "./pages/admin/DashboardPage";
import MentorsPage from "./pages/admin/MentorsPage";
import BatchesPage from "./pages/admin/BatchesPage";
import MenteesPage from "./pages/admin/MenteesPage";

import MentorDashboard from "./pages/mentor/MentorDashboard";
import LessonsPage from "./pages/mentor/LessonsPage";
import LessonDetailPage from "./pages/mentor/LessonDetailPage";
import ReviewsList from "./pages/mentor/ReviewsList";
import ReviewAttemptPage from "./pages/mentor/ReviewAttemptPage";
import MentorBatchesPage from "./pages/mentor/MentorBatchesPage";
import MentorMenteesPage from "./pages/mentor/MenteesPage";
import AnalyticsPage from "./pages/mentor/AnalyticsPage";
import MenteeDashboardPage from "./pages/mentee/DashboardPage";
import MenteeLessonsPage from "./pages/mentee/LessonsPage";
import LessonPracticePage from "./pages/mentee/LessonPracticePage";
import PracticeHistoryPage from "./pages/mentee/PracticeHistoryPage";
import PracticeResultPage from "./pages/mentee/PracticeResultPage";
import LessonPracticePlayer from "./pages/mentee/LessonPracticePlayer";
import PracticePlayerPage from "./pages/mentee/PracticePlayerPage";
import PronunciationLoadingPage from "./pages/mentee/PronunciationLoadingPage";
import PracticeCompletePage from "./pages/mentee/PracticeCompletePage";
import AssessmentPlayerPage from "./features/exercises/AssessmentPlayerPage";
import { ROUTES } from "./constants/routes";
import RootRedirect from "./routes/RootRedirect";

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <RouteProgress />
      <Routes>
        {/* <Route path="/" element={<LoginPage />} /> */}
        <Route path="/" element={<RootRedirect />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <ProtectedRoute roles={["admin"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ADMIN_MENTORS}
          element={
            <ProtectedRoute roles={["admin"]}>
              <MentorsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ADMIN_MENTEES}
          element={
            <ProtectedRoute roles={["admin"]}>
              <MenteesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_BATCHES}
          element={
            <ProtectedRoute roles={["admin"]}>
              <BatchesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MENTOR_DASHBOARD}
          element={
            <ProtectedRoute roles={["mentor"]}>
              <MentorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MENTOR_LESSONS}
          element={
            <ProtectedRoute roles={["mentor"]}>
              <LessonsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${ROUTES.MENTOR_LESSONS}/:lessonId`}
          element={
            <ProtectedRoute roles={["mentor"]}>
              <LessonDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MENTOR_REVIEWS}
          element={
            <ProtectedRoute roles={["mentor"]}>
              <ReviewsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor/reviews/:attemptId"
          element={
            <ProtectedRoute roles={["mentor"]}>
              <ReviewAttemptPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MENTOR_BATCHES}
          element={
            <ProtectedRoute roles={["mentor"]}>
              <MentorBatchesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.MENTOR_MENTEES}
          element={
            <ProtectedRoute roles={["mentor"]}>
              <MentorMenteesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MENTOR_ANALYTICS}
          element={
            <ProtectedRoute roles={["mentor"]}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MENTEE_DASHBOARD}
          element={
            <ProtectedRoute roles={["mentee"]}>
              <MenteeDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MENTEE_LESSONS}
          element={
            <ProtectedRoute roles={["mentee"]}>
              <MenteeLessonsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={`${ROUTES.MENTEE_LESSONS}/:lessonId`}
          element={
            <ProtectedRoute roles={["mentee"]}>
              <LessonPracticePage />
            </ProtectedRoute>
          }
        />

        <Route
          path={`${ROUTES.MENTEE_PRACTICE}/:lessonId/player/:attemptId`}
          element={
            <ProtectedRoute roles={["mentee"]}>
              <PracticePlayerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${ROUTES.MENTEE_PRACTICE}/:lessonId/player/:attemptId/loading`}
          element={
            <ProtectedRoute roles={["mentee"]}>
              <PronunciationLoadingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${ROUTES.MENTEE_PRACTICE}/:lessonId/complete/:attemptId`}
          element={
            <ProtectedRoute roles={["mentee"]}>
              <PracticeCompletePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${ROUTES.MENTEE_PRACTICE}/:lessonId/assessment/:exerciseId`}
          element={
            <ProtectedRoute roles={["mentee"]}>
              <AssessmentPlayerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MENTEE_HISTORY}
          element={
            <ProtectedRoute roles={["mentee"]}>
              <PracticeHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${ROUTES.MENTEE_HISTORY}/:attemptId`}
          element={
            <ProtectedRoute roles={["mentee"]}>
              <PracticeResultPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
