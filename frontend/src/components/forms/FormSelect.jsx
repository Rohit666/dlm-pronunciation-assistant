function FormSelect({
  label,
  register,
  name,
  errors,
  options = [],
  optionLabel = "label",
  optionValue = "value",
  placeholder = "Select Option",
  validation = {},
  disabled = false,
}) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium">{label}</label>

      <select
        disabled={disabled}
        {...register(name, validation)}
        className="
          w-full border rounded-xl px-4 py-3
          focus:outline-none focus:ring-2 focus:ring-indigo-500
          cursor-pointer
          disabled:bg-gray-100 disabled:cursor-not-allowed
        "
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option[optionValue]} value={option[optionValue]}>
            {option[optionLabel]}
          </option>
        ))}
      </select>

      {errors?.[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>
      )}
    </div>
  );
}

export default FormSelect;
