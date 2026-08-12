import PrimaryButton from "./PrimaryButton";

function EmptyState({ title, description, buttonText, onAction }) {
  return (
    <div
      className="
        bg-white
        rounded-3xl
        shadow-sm
        p-12
        text-center
      "
    >
      <h3 className="text-2xl font-bold">{title}</h3>

      <p className="text-gray-500 mt-3">{description}</p>

      {buttonText && (
        <PrimaryButton className="mt-6" onClick={onAction}>
          {buttonText}
        </PrimaryButton>
      )}
    </div>
  );
}

export default EmptyState;
