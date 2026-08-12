import {
  LayoutDashboard,
  Users,
  BookOpen,
  Mic,
  BarChart3,
  LogOut,
  Layers3,
  History,
  ClipboardCheck,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../constants/routes";

function Sidebar({ closeSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  let menuItems = [];

  if (user?.role === "admin") {
    menuItems = [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        path: ROUTES.ADMIN_DASHBOARD,
      },
      {
        title: "Mentors",
        icon: Users,
        path: ROUTES.ADMIN_MENTORS,
      },
      {
        title: "Mentees",
        icon: Users,
        path: ROUTES.ADMIN_MENTEES,
      },
      {
        title: "Batches",
        icon: Layers3,
        path: ROUTES.ADMIN_BATCHES,
      },
    ];
  }
  if (user?.role === "mentor") {
    menuItems = [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        path: ROUTES.MENTOR_DASHBOARD,
      },
      {
        title: "Lessons",
        icon: BookOpen,
        path: ROUTES.MENTOR_LESSONS,
      },
      {
        title: "Reviews",
        icon: ClipboardCheck,
        path: ROUTES.MENTOR_REVIEWS,
      },
      {
        title: "Batches",
        path: ROUTES.MENTOR_BATCHES,
        icon: Layers3,
      },
      {
        title: "Mentees",
        path: ROUTES.MENTOR_MENTEES,
        icon: Users,
      },
      {
        title: "Analytics",
        path: ROUTES.MENTOR_ANALYTICS,
        icon: BarChart3,
      },
    ];
  }
  if (user?.role === "mentee") {
    menuItems = [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        path: ROUTES.MENTEE_DASHBOARD,
      },
      {
        title: "Lessons",
        icon: BookOpen,
        path: ROUTES.MENTEE_LESSONS,
      },
      {
        title: "Practice History",
        icon: History,
        path: ROUTES.MENTEE_HISTORY,
      },
    ];
  }
  return (
    <div className="h-full w-72 bg-[#111827] text-white flex flex-col shadow-2xl">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold tracking-wide">DLM</h1>

        <p className="text-gray-400 text-sm mt-1">Pronunciation Assistant</p>
      </div>

      <div className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <button
              key={index}
              onClick={() => {
                navigate(item.path);

                if (closeSidebar) {
                  closeSidebar();
                }
              }}
              className={`
  w-full flex items-center gap-3 px-4 py-3 rounded-xl
  transition-all duration-300 cursor-pointer
  ${
    location.pathname === item.path
      ? "bg-indigo-600 text-white shadow-lg"
      : "hover:bg-indigo-600 text-gray-200"
  }
`}
            >
              <Icon size={20} />

              <span className="font-medium">{item.title}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="mb-4">
          <p className="font-semibold">{user?.name}</p>

          <p className="text-sm text-gray-400 capitalize">{user?.role}</p>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 py-3 rounded-xl transition-all duration-300"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
