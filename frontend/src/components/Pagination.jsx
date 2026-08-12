function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="
          px-4 py-2 rounded-xl border
          hover:bg-gray-100
          disabled:opacity-50
          disabled:cursor-not-allowed
          transition-all duration-300
          cursor-pointer
        "
      >
        Previous
      </button>

      {Array.from(
        {
          length: totalPages,
        },
        (_, index) => (
          <button
            key={index}
            onClick={() => onPageChange(index + 1)}
            className={`
              w-10 h-10 rounded-xl font-semibold transition-all duration-300 cursor-pointer
              ${
                currentPage === index + 1
                  ? "bg-indigo-600 text-white"
                  : "border hover:bg-gray-100"
              }
            `}
          >
            {index + 1}
          </button>
        ),
      )}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="
          px-4 py-2 rounded-xl border
          hover:bg-gray-100
          disabled:opacity-50
          disabled:cursor-not-allowed
          transition-all duration-300
          cursor-pointer
        "
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
