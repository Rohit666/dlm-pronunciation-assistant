import FormDrawer from "../../components/common/FormDrawer";
import Loader from "../../components/Loader";
import ReportCard from "./ReportCard";

// Comprehensive Assessment History Hubs — the read-only Diagnostic
// Report Card for one already-submitted attempt, reused by both the
// mentee's own history view and the mentor's cohort review view (the
// mentor version passes `menteeLabel` to show whose attempt this is).
// ReportCard itself needs no "read-only" flag — it was already a
// read-only display, no interactive inputs, so nothing to disable.
function AttemptReportDrawer({ open, onClose, loading, exercise, menteeLabel, attempt, answerSheet }) {
  return (
    <FormDrawer open={open} onClose={onClose} title={exercise?.title || "Assessment Report"}>
      {loading ? (
        <Loader text="Loading report card..." />
      ) : attempt ? (
        <div>
          {menteeLabel && (
            <p className="text-sm text-gray-500 mb-4">
              <span className="font-medium text-gray-700">Mentee:</span> {menteeLabel}
            </p>
          )}
          <ReportCard attempt={attempt} answerSheet={answerSheet} />
        </div>
      ) : (
        <p className="text-gray-400 text-sm">Report card not available.</p>
      )}
    </FormDrawer>
  );
}

export default AttemptReportDrawer;
