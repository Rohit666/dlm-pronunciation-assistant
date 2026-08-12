const LoadingProgressBar = ({ progress }) => {
  return (
    <div className="w-full h-4 rounded-full bg-gray-200 overflow-hidden">
      <div
        className="
          h-full
          rounded-full
          bg-gradient-to-r
          from-indigo-500
          to-violet-600
          transition-all
          duration-700
        "
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
};

export default LoadingProgressBar;
