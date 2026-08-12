function SelectField({
  label,
  options,
  register,
  name,
  errors,
  required = false,
}) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium">{label}</label>

      <select
        {...register(name, {
          required,
        })}
        className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
      >
        <option value="">Select {label}</option>

        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.batch_name}
          </option>
        ))}
      </select>

      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">{label} is required</p>
      )}
    </div>
  );
}

export default SelectField;
