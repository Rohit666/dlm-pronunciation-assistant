function Topbar() {
  return (
    <div className="h-20 bg-white shadow-sm flex items-center justify-between px-8">

      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Dashboard
        </h2>

        <p className="text-gray-500">
          Welcome back
        </p>
      </div>

      <div className="flex items-center gap-4">
        
        <div className="w-11 h-11 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
          D
        </div>
      </div>
    </div>
  );
}

export default Topbar;