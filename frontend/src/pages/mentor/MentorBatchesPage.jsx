import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import SearchInput from "../../components/SearchInput";
import StatsCard from "../../components/StatsCard";
import api from "../../services/api";

import { Layers3 } from "lucide-react";

const DEFAULT_THRESHOLD_LABEL = "Default (70%)";

function MentorBatchesPage() {
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // Per-batch draft input value while a mentor is editing the threshold,
  // keyed by batch id. Kept separate from `batches` so typing doesn't
  // clobber the saved value until the save actually succeeds.
  const [thresholdDrafts, setThresholdDrafts] = useState({});

  const [savingBatchId, setSavingBatchId] = useState(null);

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

  const handleThresholdChange = (batchId, value) => {
    setThresholdDrafts((prev) => ({
      ...prev,
      [batchId]: value,
    }));
  };

  const handleThresholdSave = async (batch) => {
    const draft = thresholdDrafts[batch.id];

    if (draft === undefined || draft === "") {
      return;
    }

    const parsed = Number(draft);

    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
      window.alert("Passing threshold must be a number between 0 and 100.");

      setThresholdDrafts((prev) => {
        const next = { ...prev };
        delete next[batch.id];
        return next;
      });

      return;
    }

    if (parsed === Number(batch.default_passing_threshold)) {
      setThresholdDrafts((prev) => {
        const next = { ...prev };
        delete next[batch.id];
        return next;
      });

      return;
    }

    setSavingBatchId(batch.id);

    try {
      const response = await api.put(`/mentor/batches/${batch.id}/threshold`, {
        default_passing_threshold: parsed,
      });

      const updatedBatch = response.data.batch;

      setBatches((prev) =>
        prev.map((b) => (b.id === batch.id ? { ...b, ...updatedBatch } : b)),
      );

      setThresholdDrafts((prev) => {
        const next = { ...prev };
        delete next[batch.id];
        return next;
      });
    } catch (error) {
      console.error(error);
      window.alert("Failed to update passing threshold. Please try again.");
    } finally {
      setSavingBatchId(null);
    }
  };

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
    {
      key: "default_passing_threshold",
      label: "Passing Threshold (%)",
      render: (row) => {
        const draftValue = thresholdDrafts[row.id];

        const displayValue =
          draftValue !== undefined
            ? draftValue
            : row.default_passing_threshold ?? "";

        const placeholder =
          row.default_passing_threshold === null ||
          row.default_passing_threshold === undefined
            ? DEFAULT_THRESHOLD_LABEL
            : "";

        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={displayValue}
              placeholder={placeholder}
              disabled={savingBatchId === row.id}
              onChange={(e) => handleThresholdChange(row.id, e.target.value)}
              onBlur={() => handleThresholdSave(row)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.target.blur();
                }
              }}
              className="w-24 rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
            />
            {savingBatchId === row.id && (
              <span className="text-xs text-gray-400">Saving...</span>
            )}
          </div>
        );
      },
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
