import { useEffect, useState } from "react";

import {
  Layers3,
  Users,
  BookOpen,
  FileClock,
  ClipboardCheck,
  Activity,
} from "lucide-react";

import toast from "react-hot-toast";

import DashboardLayout from "../../layouts/DashboardLayout";

import PageHeader from "../../components/PageHeader";

import StatsCard from "../../components/StatsCard";

import DataTable from "../../components/DataTable";

import api from "../../services/api";

function MentorDashboard() {
  const [dashboardData, setDashboardData] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/mentor-dashboard");
      console.log("Dashboard Response:", response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (mentee) => mentee.User?.name,
    },
    {
      key: "email",
      label: "Email",
      render: (mentee) => mentee.User?.email,
    },
    {
      key: "roll_number",
      label: "Roll Number",
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Mentor Dashboard"
        description="Monitor batches and mentees"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatsCard
          title="Assigned Batches"
          value={loading ? "..." : dashboardData?.stats?.assignedBatches || 0}
          icon={Layers3}
        />

        <StatsCard
          title="Total Mentees"
          value={loading ? "..." : dashboardData?.stats?.totalMentees || 0}
          icon={Users}
        />

        <StatsCard
          title="Published Lessons"
          value={loading ? "..." : dashboardData?.stats?.publishedLessons || 0}
          icon={BookOpen}
        />

        <StatsCard
          title="Draft Lessons"
          value={loading ? "..." : dashboardData?.stats?.draftLessons || 0}
          icon={FileClock}
        />

        <StatsCard
          title="Pending Reviews"
          value={loading ? "..." : dashboardData?.stats?.pendingReviews || 0}
          icon={ClipboardCheck}
        />

        <StatsCard
          title="Today's Submissions"
          value={loading ? "..." : dashboardData?.stats?.todaySubmissions || 0}
          icon={Activity}
        />
      </div>
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {dashboardData?.recentActivities?.length === 0 ? (
              <div className="text-gray-500">No recent activity</div>
            ) : (
              dashboardData?.recentActivities?.map((activity) => (
                <div
                  key={activity.id}
                  className="border rounded-2xl p-4 hover:bg-gray-50 transition-all duration-300"
                >
                  <p className="font-semibold text-gray-800">
                    {activity.description}
                  </p>

                  <p className="text-gray-500 text-sm mt-2">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Pending Reviews</h2>
          </div>
          <div className="space-y-4">
            <div className="border rounded-2xl p-4">
              <p className="font-semibold text-lg">
                {dashboardData?.stats?.pendingReviews || 0} Pending Reviews
              </p>

              <p className="text-gray-500 text-sm mt-2">
                Pronunciation evaluations waiting for mentor review
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MentorDashboard;
