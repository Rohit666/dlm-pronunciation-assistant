const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path = require("path");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const batchRoutes = require("./routes/batchRoutes");
const menteeRoutes = require("./routes/menteeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const mentorDashboardRoutes = require("./routes/mentorDashboardRoutes");
const menteeDashboardRoutes = require("./routes/menteeDashboardRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const lessonSentenceRoutes = require("./routes/lessonSentenceRoutes");
const practiceRoutes = require("./routes/practiceRoutes");
const mentorReviewRoutes = require("./routes/mentorReviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const practiceAttemptRoutes = require("./routes/practiceAttemptRoutes");
const mentorAnalyticsRoutes = require("./routes/mentorAnalyticsRoutes");
const menteeInsightsRoutes = require("./routes/menteeInsightsRoutes");
const mentorInsightsRoutes = require("./routes/mentorInsightsRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const aiRuntimeRoutes = require("./routes/aiRuntimeRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  next();
});
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");

  next();
});
// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "DLM Pronunciation Assistant API Running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/mentees", menteeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/mentor-dashboard", mentorDashboardRoutes);
app.use("/api/mentee-dashboard", menteeDashboardRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/lessons", lessonRoutes);
app.use("/api/lesson-sentences", lessonSentenceRoutes);
app.use("/api/practice", practiceRoutes);
app.use("/api/mentor-reviews", mentorReviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/practice-attempts", practiceAttemptRoutes);
app.use("/api/analytics", mentorAnalyticsRoutes);
// Milestone 5/6 — mounted at the same /api/analytics prefix as the
// existing weak-students/inactive-students/etc router above. No path
// collision: these live under /mentee/* and /mentor/* sub-paths that
// router doesn't define.
app.use("/api/analytics", menteeInsightsRoutes);
app.use("/api/analytics", mentorInsightsRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/ai-runtime", aiRuntimeRoutes);
// Milestone 9 — POST/GET /api/exercises/:exerciseId/{submit,attempts}.
// Exercise CRUD-by-lesson lives under /api/lessons (lessonRoutes.js) and
// /api/mentor/lessons (mentorRoutes.js) instead, per the spec's exact
// paths — this router only owns the /api/exercises/:exerciseId/* half.
app.use("/api/exercises", exerciseRoutes);
module.exports = app;
