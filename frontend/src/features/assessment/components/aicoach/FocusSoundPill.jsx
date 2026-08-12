const FocusSoundPill = ({ sound }) => {
  if (!sound) return null;

  return (
    <div
      className="
        inline-flex
        items-center
        gap-4
        px-5
        py-3
        rounded-2xl
        border
        border-amber-200
        bg-amber-50
        self-start
      "
    >
      <span
        className="
          text-gray-500
          text-sm
          font-medium
        "
      >
        Focus Sound
      </span>

      <span
        className="
          text-3xl
          font-bold
          text-orange-600
        "
      >
        {sound}
      </span>
    </div>
  );
};

export default FocusSoundPill;
