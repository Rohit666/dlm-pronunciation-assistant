import { Menu } from "lucide-react";
import NotificationBell from "../components/NotificationBell";

function Topbar({ openSidebar }) {
  return (
    <div className="h-20 bg-white shadow-sm flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={openSidebar}
          className="lg:hidden w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-300 cursor-pointer"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

          <p className="text-gray-500">Welcome back</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="w-11 h-11 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
          D
        </div>
      </div>
    </div>
  );
}

export default Topbar;
