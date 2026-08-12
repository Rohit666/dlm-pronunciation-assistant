function StatsCard({
  title,
  value,
  icon,
}) {
  const Icon = icon;

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 hover:shadow-xl transition-all duration-300 cursor-pointer">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-gray-500 text-sm">
            {title}
          </p>

          <h2 className="text-4xl font-bold mt-3 text-gray-800">
            {value}
          </h2>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center">
          <Icon className="text-indigo-600" />
        </div>

      </div>

    </div>
  );
}

export default StatsCard;