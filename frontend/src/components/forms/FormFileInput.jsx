function FormFileInput({
  label,
  register,
  name,
  errors,
  validation = {},
  accept = "*",
  disabled = false,
  multiple = false,
  onFileChange,
}) {
  const registered = register(name, validation);

  return (
    <div>
      <label className="block mb-2 text-sm font-medium">{label}</label>

      <input
        type="file"
        accept={accept}
        disabled={disabled}
        multiple={multiple}
        {...registered}
        onChange={(e) => {
          registered.onChange(e);

          if (onFileChange) {
            onFileChange(e);
          }
        }}
        className="
          w-full border rounded-xl px-4 py-3
          file:mr-4 file:py-2 file:px-4
          file:rounded-lg file:border-0
          file:text-sm file:font-semibold
          file:bg-indigo-100 file:text-indigo-700
          hover:file:bg-indigo-200
          focus:outline-none focus:ring-2 focus:ring-indigo-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
        "
      />

      {errors?.[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>
      )}
    </div>
  );
}

export default FormFileInput;
