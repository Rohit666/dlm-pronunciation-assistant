import { PHONEME_CATALOG } from "../../mock/phonemeCatalog";
import { heatmapColorClass } from "../../utils/studentTiering";

// Class-wide phoneme struggle matrix (SRS 4.5 "Class-Wide Phoneme
// Matrix"). Severity is status color (green/amber/red) + the struggle
// percentage always shown as text, so color is never the only signal.
function PhonemeHeatmap({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            Class-Wide Phoneme Struggle Heatmap
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Share of attempts scoring below 60% accuracy, by sound
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Low
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Moderate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> High
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {data.map((cell) => {
          const meta = PHONEME_CATALOG.find((p) => p.symbol === cell.symbol);

          return (
            <div
              key={cell.symbol}
              className="rounded-2xl border border-gray-100 p-4 text-center"
            >
              <div
                className={`w-full h-2 rounded-full mb-3 ${heatmapColorClass(cell.struggleRate)}`}
                role="img"
                aria-label={`${cell.struggleRate}% struggle rate`}
              />
              <p className="text-2xl font-bold text-gray-800">{meta?.ipa ?? cell.symbol}</p>
              <p className="text-xs text-gray-500 mt-1">{meta?.label}</p>
              <p className="text-lg font-bold text-gray-800 mt-3">
                {cell.struggleRate}%
              </p>
              <p className="text-xs text-gray-400">
                {cell.strugglingStudents}/{cell.totalStudents} students
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PhonemeHeatmap;
