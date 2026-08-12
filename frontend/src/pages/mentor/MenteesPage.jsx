import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";

import PageHeader from "../../components/PageHeader";

import DataTable from "../../components/DataTable";

import SearchInput from "../../components/SearchInput";

import StatsCard from "../../components/StatsCard";
import Pagination from "../../components/Pagination";
import api from "../../services/api";

import { Users } from "lucide-react";

function MentorMenteesPage() {
  const [mentees, setMentees] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const fetchMentees = async () => {
    try {
      const response = await api.get(
        `/mentor/mentees?page=${currentPage}&limit=10`,
      );

      setMentees(response.data.rows);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentees();
  }, [currentPage]);

  const filteredMentees = mentees.filter((mentee) =>
    mentee.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    {
      key: "name",
      label: "Name",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "roll_number",
      label: "Roll Number",
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="My Mentees"
        description="View mentees from assigned batches"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Mentees"
          value={loading ? "..." : mentees.length}
          icon={Users}
        />
      </div>

      <div className="mt-8 bg-white rounded-3xl shadow-sm p-6">
        <div className="mb-6">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mentees..."
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredMentees}
          loading={loading}
          emptyMessage="No mentees assigned"
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </DashboardLayout>
  );
}

export default MentorMenteesPage;
