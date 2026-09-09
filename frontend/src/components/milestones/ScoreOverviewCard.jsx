// Accuracy / fluency / completeness overview meters (SRS 4.3's three
// acoustic scoring dimensions). Single-axis (0-100) thin bars, status
// color by score band, value always shown as text — never color alone.
function bandColor(score) {
  if (score >= 80) return { bar: "bg-green-500", text: "text-green-700" };
  if (score >= 60) return { bar: "bg-amber-400", text: "text-amber-700" };
  return { bar: "bg-red-500", text: "text-red-700" };
}

function ScoreMeter({ label, score }) {
  const { bar, text } = bandColor(score);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className={`text-sm font-bold ${text}`}>{score}%</span>
      </div>

      <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${bar} transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>
    </div>
  );
}

function ScoreOverviewCard({ scores }) {
  if (!scores) return null;

  // fluency/completeness are omitted (not 0) when the data source
  // can't supply them — e.g. the real ai-runtime pipeline has no
  // fluency_score/completeness_score. Skip the meter entirely rather
  // than render a fabricated "0%"/"null%".
  const hasAccuracy = scores.accuracy !== null && scores.accuracy !== undefined;
  const hasFluency = scores.fluency !== null && scores.fluency !== undefined;
  const hasCompleteness =
    scores.completeness !== null && scores.completeness !== undefined;

  if (!hasAccuracy && !hasFluency && !hasCompleteness) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-6">
        Accuracy &amp; Fluency Overview
      </h3>

      <div className="space-y-5">
        {hasAccuracy && <ScoreMeter label="Accuracy" score={scores.accuracy} />}
        {hasFluency && <ScoreMeter label="Fluency" score={scores.fluency} />}
        {hasCompleteness && (
          <ScoreMeter label="Completeness" score={scores.completeness} />
        )}
      </div>
    </div>
  );
}

export default ScoreOverviewCard;
