const PhonemeHeader = ({ phoneme, name }) => {
  return (
    <div className="text-center">
      <h2
        className="
          text-2xl
          font-bold
          text-gray-900
        "
      >
        Pronunciation Tip
      </h2>

      <div className="mt-6">
        <div
          className="
            text-7xl
            font-black
            text-indigo-600
          "
        >
          {phoneme}
        </div>

        <p
          className="
            mt-3
            text-gray-500
          "
        >
          {name}
        </p>
      </div>
    </div>
  );
};

export default PhonemeHeader;
