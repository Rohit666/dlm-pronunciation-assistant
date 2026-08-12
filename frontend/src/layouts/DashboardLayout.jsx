import { useState } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-gray-100">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden cursor-pointer"
        />
      )}

      <div className="flex h-full">
        {/* Sidebar */}
        <div
          className={`
            fixed lg:static z-50
            transition-all duration-300
            h-full
            ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
          `}
        >
          <Sidebar closeSidebar={() => setSidebarOpen(false)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar openSidebar={() => setSidebarOpen(true)} />

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
