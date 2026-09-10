import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import FormDrawer from "../../../components/common/FormDrawer";
import DataTable from "../../../components/DataTable";
import Loader from "../../../components/Loader";
import AttemptReportDrawer from "../AttemptReportDrawer";
import {
  getExerciseAttemptsForMentor,
  getAttemptDetailForMentor,
} from "../../../services/exerciseService";
import { formatDate } from "../../../utils/dateUtils";

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

// Comprehensive Assessment History Hubs (mentor half) — cohort review.
// Opened from a "View Submissions" action on ExerciseCard.jsx. Lists
// every mentee submission for one exercise (scoped server-side to the
// mentor's own batches — see resolveMentorVisibleMenteeIds in
// exerciseController.js), with batch/mentee filters, and an "Inspect
// Answer Sheet" action that opens a second drawer showing the exact
// same Diagnostic Report Card the mentee saw (via ReportCard.jsx),
// including the sub-question breakdown for comprehension.
function ExerciseSubmissionsDrawer({ exercise, open, onClose }) {
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState([]);
  const [menteeFilter, setMenteeFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");

  const [inspectOpen, setInspectOpen] = useState(false);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectData, setInspectData] = useState(null);

  useEffect(() => {
    if (!open || !exercise) return;
    (async () => {
      try {
        setLoading(true);
        setMenteeFilter("all");
        setBatchFilter("all");
        const data = await getExerciseAttemptsForMentor(exercise.id);
        setAttempts(data.attempts || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, exercise]);

  const mentees = useMemo(() => {
    const seen = new Map();
    attempts.forEach((a) => {
      if (a.Mentee?.id != null) seen.set(a.Mentee.id, a.Mentee.User?.name || `Mentee #${a.Mentee.id}`);
    });
    return Array.from(seen, ([id, name]) => ({ id, name }));
  }, [attempts]);

  const batches = useMemo(() => {
    const seen = new Map();
    attempts.forEach((a) => {
      if (a.Mentee?.Batch?.id != null) seen.set(a.Mentee.Batch.id, a.Mentee.Batch.batch_name);
    });
    return Array.from(seen, ([id, name]) => ({ id, name }));
  }, [attempts]);

  const filteredAttempts = attempts.filter((a) => {
    if (menteeFilter !== "all" && String(a.Mentee?.id) !== menteeFilter) return false;
    if (batchFilter !== "all" && String(a.Mentee?.Batch?.id) !== batchFilter) return false;
    return true;
  });

  const inspectAnswerSheet = async (attempt) => {
    setInspectOpen(true);
    setInspectLoading(true);
    try {
      const data = await getAttemptDetailForMentor(attempt.id);
      setInspectData(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load answer sheet");
      setInspectOpen(false);
    } finally {
      setInspectLoading(false);
    }
  };

  const columns = [
    {
      key: "mentee",
      label: "Mentee",
      render: (a) => a.Mentee?.User?.name || a.Mentee?.User?.email || `Mentee #${a.Mentee?.id}`,
    },
    { key: "batch", label: "Batch", render: (a) => a.Mentee?.Batch?.batch_name || "—" },
    { key: "attempt_number", label: "Attempt #" },
    { key: "percentage", label: "Score", render: (a) => `${Number(a.percentage)}%` },
    { key: "passed", label: "Status", render: (a) => <StatusPill passed={a.passed} /> },
    { key: "submitted_at", label: "Submitted", render: (a) => formatDate(a.submitted_at) },
    {
      key: "action",
      label: "",
      render: (a) => (
        <button
          type="button"
          onClick={() => inspectAnswerSheet(a)}
          className="text-indigo-600 font-semibold text-sm hover:underline cursor-pointer"
        >
          Inspect Answer Sheet
        </button>
      ),
    },
  ];

  return (
    <>
      <FormDrawer open={open} onClose={onClose} title={`Submissions · ${exercise?.title || ""}`}>
        {loading ? (
          <Loader text="Loading submissions..." />
        ) : (
          <div>
            <div className="flex flex-wrap gap-3 mb-5">
              <select
                value={menteeFilter}
                onChange={(e) => setMenteeFilter(e.target.value)}
                className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All mentees</option>
                {mentees.map((m) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.name}
                  </option>
                ))}
              </select>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All batches</option>
                {batches.map((b) => (
                  <option key={b.id} value={String(b.id)}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <DataTable
              columns={columns}
              data={filteredAttempts}
              loading={false}
              emptyMessage="No submissions yet for this exercise."
            />
          </div>
        )}
      </FormDrawer>

      <AttemptReportDrawer
        open={inspectOpen}
        onClose={() => setInspectOpen(false)}
        loading={inspectLoading}
        exercise={inspectData?.exercise}
        menteeLabel={inspectData?.mentee?.User?.name || inspectData?.mentee?.User?.email}
        attempt={inspectData?.attempt}
        answerSheet={inspectData?.answerSheet}
      />
    </>
  );
}

export default ExerciseSubmissionsDrawer;
