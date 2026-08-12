const bars = [12, 22, 34, 48, 62, 48, 34, 22, 16, 24, 42, 60, 42, 24, 16];

const RecognitionWave = ({ state = "success" }) => {
  const colorMap = {
    success: "#10b981",
    partial_match: "#f59e0b",
    no_match: "#ef4444",
    no_speech: "#9ca3af",
  };

  const color = colorMap[state] || colorMap.success;

  return (
    <div
      className="
    flex
    items-center
    gap-[3px]
    h-20
    shrink-0
  "
    >
      {bars.map((height, index) => (
        <span
          key={index}
          className="recognition-wave-bar"
          style={{
            height,

            background: color,
            animationDelay: `${index * 120}ms`,
          }}
        />
      ))}
    </div>
  );
};

export default RecognitionWave;
