import { useEffect, useState } from "react";

import { Bell } from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");

      setNotifications(response.data.notifications);

      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, [user?.id]);
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);
    return () => {
      clearInterval(interval);
      setNotifications([]);
      setUnreadCount(0);
    };
  }, [user?.id]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);

      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-11 h-11 rounded-2xl bg-white shadow-sm border flex items-center justify-center hover:bg-gray-50 transition-all duration-300 cursor-pointer"
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-[380px] bg-white rounded-3xl shadow-2xl border z-50 overflow-hidden">
          <div className="p-5 border-b">
            <h3 className="text-lg font-bold">Notifications</h3>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`
                      w-full text-left p-5 border-b transition-all duration-300 cursor-pointer
                      hover:bg-gray-50
                      ${!notification.is_read ? "bg-indigo-50" : ""}
                    `}
                >
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {notification.title}
                  </h4>

                  <p className="text-sm text-gray-600">
                    {notification.message}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
