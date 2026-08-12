const PracticeWords = ({ words }) => {
  return (
    <div>
      <h4
        className="
          text-lg
          font-semibold
          text-gray-900
        "
      >
        Practice Words
      </h4>

      <div
        className="
          mt-4
          flex
          flex-wrap
          gap-3
        "
      >
        {words.map((word) => (
          <span
            key={word}
            className="
              px-4
              py-2
              rounded-xl
              bg-indigo-50
              text-indigo-700
              font-semibold
            "
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PracticeWords;
