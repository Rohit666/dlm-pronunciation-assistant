function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">

        <h2 className="text-2xl font-bold text-gray-800">
          {title}
        </h2>

        <p className="text-gray-500 mt-3 leading-7">
          {message}
        </p>

        <div className="flex justify-end gap-4 mt-8">

          <button
            onClick={onCancel}
            className="px-5 py-3 rounded-2xl border hover:bg-gray-100 transition-all duration-300 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-5 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white transition-all duration-300 cursor-pointer"
          >
            Confirm
          </button>

        </div>

      </div>
    </div>
  );
}

export default ConfirmModal;