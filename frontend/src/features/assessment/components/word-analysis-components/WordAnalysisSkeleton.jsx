const Bar = ({ className = "" }) => (
  <div
    className={`
      bg-gray-200
      rounded-xl
      animate-pulse
      ${className}
    `}
  />
);

const WordAnalysisSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Expected / Detected */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-2xl border p-6">
          <Bar className="h-4 w-20" />
          <Bar className="h-10 w-40 mt-5" />
        </div>

        <div className="rounded-2xl border p-6">
          <Bar className="h-4 w-20" />
          <Bar className="h-10 w-40 mt-5" />
        </div>
      </div>

      {/* Accuracy */}

      <Bar className="h-5 w-24" />

      <Bar className="h-3 w-full" />

      {/* Issue */}

      <div className="rounded-2xl border p-6">
        <Bar className="h-5 w-44" />

        <Bar className="h-4 w-full mt-5" />

        <Bar className="h-4 w-2/3 mt-3" />
      </div>

      {/* Recommendation */}

      <div className="rounded-2xl border p-6">
        <Bar className="h-5 w-40" />

        <Bar className="h-4 w-full mt-5" />

        <Bar className="h-4 w-5/6 mt-3" />

        <Bar className="h-4 w-3/4 mt-3" />
      </div>
    </div>
  );
};

export default WordAnalysisSkeleton;
