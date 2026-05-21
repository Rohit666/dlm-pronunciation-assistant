import DashboardLayout from '../layouts/DashboardLayout';

function AdminDashboard() {
  const stats = [
    {
      title: 'Total Mentors',
      value: 12,
    },
    {
      title: 'Total Mentees',
      value: 148,
    },
    {
      title: 'Lessons',
      value: 42,
    },
    {
      title: 'Practice Sessions',
      value: 980,
    },
  ];

  return (
    <DashboardLayout>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl shadow-sm p-6 hover:shadow-xl transition-all duration-300"
          >
            <p className="text-gray-500 text-sm">
              {stat.title}
            </p>

            <h2 className="text-4xl font-bold mt-3 text-gray-800">
              {stat.value}
            </h2>
          </div>
        ))}

      </div>

      <div className="mt-8 bg-white rounded-3xl p-8 shadow-sm">
        
        <h2 className="text-2xl font-bold mb-4">
          System Overview
        </h2>

        <p className="text-gray-600 leading-8">
          Welcome to DLM Pronunciation Assistant administration dashboard.
          This platform helps mentors and mentees improve pronunciation,
          fluency and speaking confidence through structured speaking practice.
        </p>
      </div>

    </DashboardLayout>
  );
}

export default AdminDashboard;