import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import SearchInput from "../../components/SearchInput";
import StatsCard from "../../components/StatsCard";
import api from "../../services/api";

import { Layers3 } from "lucide-react";

function MentorBatchesPage() {
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const fetchBatches = async () => {
    try {
      const response = await api.get("/mentor/batches");

      setBatches(response.data.batches);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const filteredBatches = batches.filter((batch) =>
    batch.batch_name.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    {
      key: "batch_name",
      label: "Batch",
    },
    {
      key: "description",
      label: "Description",
      render: (row) => row.description || "No description",
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="My Batches"
        description="View assigned mentor batches"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Assigned Batches"
          value={loading ? "..." : batches.length}
          icon={Layers3}
        />
      </div>

      <div className="mt-8 bg-white rounded-3xl shadow-sm p-6">
        <div className="mb-6">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search batches..."
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredBatches}
          loading={loading}
          emptyMessage="No batches assigned"
        />
      </div>
    </DashboardLayout>
  );
}

export default MentorBatchesPage;
