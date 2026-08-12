function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className=" cursor-pointer
        bg-indigo-600
        text-white
        px-6 py-3
        rounded-xl
        hover:-translate-y-1
hover:shadow-xl
active:translate-y-0
duration-300
        hover:bg-indigo-700
        disabled:opacity-50
        transition-all 
      "
    >
      {children}
    </button>
  );
}

export default PrimaryButton;
