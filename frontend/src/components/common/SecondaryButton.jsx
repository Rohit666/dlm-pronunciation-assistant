function SecondaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="
        border
        px-4 py-2
        rounded-xl
        hover:bg-gray-50
        cursor-pointer
        transition-all
      "
    >
      {children}
    </button>
  );
}
export default SecondaryButton;
