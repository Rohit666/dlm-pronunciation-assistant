const bars = [24, 48, 72, 48, 24, 48, 72, 48, 24];

const LoadingWave = () => {
  return (
    <div className="flex justify-center items-end gap-3 h-24">
      {bars.map((height, index) => (
        <div
          key={index}
          className="bg-gradient-to-t from-indigo-700 to-violet-500 rounded-full"
          style={{
            width: "10px",
            height: `${height}px`,
            animation: `pulse 1.2s ease-in-out infinite`,
            animationDelay: `${index * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
};

export default LoadingWave;
