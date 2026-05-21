import {
  LayoutDashboard,
  Users,
  BookOpen,
  Mic,
  BarChart3,
  LogOut,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();

    navigate('/');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Users',
      icon: Users,
    },
    {
      title: 'Lessons',
      icon: BookOpen,
    },
    {
      title: 'Practice',
      icon: Mic,
    },
    {
      title: 'Reports',
      icon: BarChart3,
    },
  ];

  return (
    <div className="h-screen w-72 bg-[#111827] text-white flex flex-col">

      <div className="p-6 border-b border-gray-700">
        
        <h1 className="text-2xl font-bold tracking-wide">
          DLM
        </h1>

        <p className="text-gray-400 text-sm mt-1">
          Pronunciation Assistant
        </p>
      </div>

      <div className="flex-1 p-4 space-y-2">
        
        {menuItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <button
              key={index}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-600 transition-all duration-300"
            >
              <Icon size={20} />

              <span className="font-medium">
                {item.title}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-700">

        <div className="mb-4">
          <p className="font-semibold">
            {user?.name}
          </p>

          <p className="text-sm text-gray-400 capitalize">
            {user?.role}
          </p>
        </div>

        <button
          onClick={handleLogout}
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