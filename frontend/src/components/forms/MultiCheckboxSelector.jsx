function MultiCheckboxSelector({
  label,
  options,
  selectedValues,
  setSelectedValues,
}) {
  const handleToggle = (value) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((item) => item !== value));
    } else {
      setSelectedValues([...selectedValues, value]);
    }
  };

  return (
    <div>
      <label
        className="
          block
          mb-3
          text-sm
          font-medium
          text-gray-700
        "
      >
        {label}
      </label>

      <div
        className="
          grid
          grid-cols-2
          md:grid-cols-3
          gap-3
        "
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="
              flex
              items-center
              gap-2
              p-3
              border
              rounded-xl
              cursor-pointer
              hover:bg-gray-50
            "
          >
            <input
              type="checkbox"
              checked={selectedValues.includes(option.value)}
              onChange={() => handleToggle(option.value)}
            />

            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
export default MultiCheckboxSelector;
