import { useEffect, useState } from "react";

import { Users, GraduationCap, Layers3, UserCheck } from "lucide-react";

import toast from "react-hot-toast";

import DashboardLayout from "../../layouts/DashboardLayout";

import StatsCard from "../../components/StatsCard";

import PageHeader from "../../components/PageHeader";

import api from "../../services/api";

function DashboardPage() {
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await api.get("/dashboard/admin/stats");

      setStats(response.data.stats);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cards = [
    {
      title: "Total Mentors",
      value: stats?.totalMentors || 0,
      icon: GraduationCap,
    },
    {
      title: "Total Mentees",
      value: stats?.totalMentees || 0,
      icon: Users,
    },
    {
      title: "Total Batches",
      value: stats?.totalBatches || 0,
      icon: Layers3,
    },
    {
      title: "Assigned Mentees",
      value: stats?.totalAssignedMentees || 0,
      icon: UserCheck,
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Admin Dashboard"
        description="System overview and analytics"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <StatsCard
            key={index}
            title={card.title}
            value={loading ? "..." : card.value}
            icon={card.icon}
          />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-4">Platform Overview</h2>

          <p className="text-gray-600 leading-8">
            DLM Pronunciation Assistant helps mentors and mentees improve
            speaking confidence, pronunciation and fluency through structured
            learning and practice workflows.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-4">Current Status</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Mentors</span>

              <span className="font-bold">{stats?.totalMentors || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Mentees</span>

              <span className="font-bold">{stats?.totalMentees || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Batches</span>

              <span className="font-bold">{stats?.totalBatches || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;
