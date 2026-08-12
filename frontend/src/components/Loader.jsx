function Loader({ text = "Please wait..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-5" />

      <p className="text-gray-500 text-lg">{text}</p>
    </div>
  );
}

export default Loader;
