const AssessmentCard = ({ children, className = "" }) => {
  return (
    <div
      className={`
                bg-white
                rounded-3xl
                shadow-sm
                hover:shadow-lg
                transition-all
                duration-300
                p-6
                ${className}
            `}
    >
      {children}
    </div>
  );
};

export default AssessmentCard;
