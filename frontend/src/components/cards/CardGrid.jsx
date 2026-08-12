function CardGrid({ children }) {
  return (
    <div
      className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-3
        gap-6
      "
    >
      {children}
    </div>
  );
}

export default CardGrid;
