import { CheckCircle2, LoaderCircle, Circle } from "lucide-react";

const LoadingStep = ({ title, status }) => {
  const icon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="text-green-600" size={22} />;

      case "active":
        return (
          <LoaderCircle className="text-indigo-600 animate-spin" size={22} />
        );

      default:
        return <Circle className="text-gray-300" size={20} />;
    }
  };

  const textColor = () => {
    switch (status) {
      case "completed":
        return "text-green-700";

      case "active":
        return "text-indigo-700 font-semibold";

      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="flex items-center gap-4 py-2">
      {icon()}

      <span className={`text-lg transition-all duration-300 ${textColor()}`}>
        {title}
      </span>
    </div>
  );
};

export default LoadingStep;
