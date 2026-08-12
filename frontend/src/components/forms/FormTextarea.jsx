function FormTextarea({
  label,
  register,
  name,
  errors,
  validation = {},
  rows = 5,
  placeholder = "",
  disabled = false,
}) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium">{label}</label>

      <textarea
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        {...register(name, validation)}
        className="
          w-full border rounded-xl px-4 py-3
          focus:outline-none focus:ring-2 focus:ring-indigo-500
          resize-none
          disabled:bg-gray-100 disabled:cursor-not-allowed
        "
      />

      {errors?.[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>
      )}
    </div>
  );
}

export default FormTextarea;
