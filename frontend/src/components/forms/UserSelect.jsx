import FormSelect from "./FormSelect";

function UserSelect({ label, options, register, name, errors }) {
  const formattedOptions = options.map((option) => ({
    value: option.id,

    label: option.User?.name || option.name,
  }));

  return (
    <FormSelect
      label={label}
      register={register}
      name={name}
      errors={errors}
      options={formattedOptions}
      optionLabel="label"
      optionValue="value"
      placeholder={`Select ${label}`}
    />
  );
}

export default UserSelect;
