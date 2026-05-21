import Sidebar from './Sidebar';
import Topbar from './Topbar';

function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar />

        <main className="flex-1 p-8">
          {children}
        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;