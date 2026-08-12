import { useEffect, useState } from "react";
import { Trash2, Layers3, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import StatsCard from "../../components/StatsCard";
import SearchInput from "../../components/SearchInput";
import DataTable from "../../components/DataTable";
import ConfirmModal from "../../components/ConfirmModal";
import UserSelect from "../../components/forms/UserSelect";
import FormInput from "../../components/forms/FormInput";
import FormTextarea from "../../components/forms/FormTextarea";
import api from "../../services/api";
import FormDrawer from "../../components/common/FormDrawer";
import PageActions from "../../components/common/PageActions";
import PrimaryButton from "../../components/common/PrimaryButton";
import Loader from "../../components/Loader";
import EmptyState from "../../components/common/EmptyState";

function BatchesPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const {
    register: editRegister,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: { errors: editErrors },
  } = useForm();
  const fetchBatches = async () => {
    try {
      const response = await api.get("/batches");

      setBatches(response.data.batches);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };
  const fetchMentors = async () => {
    try {
      const response = await api.get("/users");

      const mentorUsers = response.data.users.filter(
        (user) => user.role === "mentor",
      );

      setMentors(mentorUsers);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load mentors");
    }
  };
  useEffect(() => {
    fetchBatches();

    fetchMentors();
  }, []);

  const filteredBatches = batches.filter((batch) =>
    batch.batch_name.toLowerCase().includes(search.toLowerCase()),
  );

  const onSubmit = async (data) => {
    try {
      await api.post("/batches", data);

      toast.success("Batch created successfully");

      reset();

      fetchBatches();
    } catch (error) {
      console.error(error);

      toast.error("Failed to create batch");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/batches/${selectedBatch.id}`);

      toast.success("Batch deleted successfully");

      setDeleteModal(false);

      fetchBatches();
    } catch (error) {
      console.error(error);

      toast.error("Failed to delete batch");
    }
  };
  const handleEdit = (batch) => {
    setSelectedBatch(batch);
    resetEditForm({
      batch_name: batch.batch_name,
      description: batch.description,
      mentor_id: String(batch.mentor_id || ""),
    });

    setShowEditDrawer(true);
  };
  const onEditSubmit = async (data) => {
    try {
      await api.put(`/batches/${selectedBatch.id}`, data);
      toast.success("Batch updated successfully");
      setShowEditDrawer(false);
      fetchBatches();
    } catch (error) {
      console.error(error);

      toast.error("Failed to update batch");
    }
  };
  const columns = [
    {
      key: "batch_name",
      label: "Batch Name",
    },
    {
      key: "description",
      label: "Description",
    },
    {
      key: "mentor",
      label: "Mentor",
      render: (batch) => batch.User?.name || "-",
    },
    {
      key: "actions",
      label: "Actions",
      render: (batch) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleEdit(batch)}
            className="w-10 h-10 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 cursor-pointer"
          >
            <Pencil size={18} className="text-blue-600" />
          </button>
          <button
            onClick={() => {
              setSelectedBatch(batch);

              setDeleteModal(true);
            }}
            className="w-10 h-10 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 cursor-pointer"
          >
            <Trash2 size={18} className="text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Batches"
        description="Manage batches and learning groups"
      />
      <PageActions>
        <PrimaryButton
          onClick={() => {
            reset();
            setShowCreateDrawer(true);
          }}
        >
          + Create Batch
        </PrimaryButton>
      </PageActions>
      <div className="">
        <div className="xl:col-span-2 space-y-6">
          <StatsCard
            title="Total Batches"
            value={batches.length}
            icon={Layers3}
          />

          <div className="bg-white rounded-3xl shadow-sm p-6">
            {loading ? (
              <Loader text="Loading batches..." />
            ) : filteredBatches.length === 0 ? (
              <EmptyState
                title="No batches found"
                icon={Layers3}
                description="Try adjusting your search or create a new batch."
                buttonText="Create Batch"
                onButtonClick={() => {
                  reset();
                  setShowCreateDrawer(true);
                }}
              />
            ) : (
              <div className="overflow-x-auto">
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
                  emptyMessage="No batches found"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal}
        title="Delete Batch"
        message="Are you sure you want to delete this batch?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(false)}
      />

      <FormDrawer
        open={showEditDrawer}
        title="Edit Batch"
        onClose={() => setShowEditDrawer(false)}
      >
        {/* Edit form content goes here */}
        <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-5">
          <div className="mb-4">
            <FormInput
              label="Batch Name"
              register={editRegister}
              name="batch_name"
              errors={editErrors}
              validation={{
                required: "Batch name is required",
              }}
            />
          </div>
          <div className="mb-4">
            <FormTextarea
              label="Description"
              register={editRegister}
              name="description"
              errors={editErrors}
            />
          </div>
          <div className="mb-4">
            <UserSelect
              label="Mentor"
              options={mentors}
              register={editRegister}
              name="mentor_id"
              errors={editErrors}
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowEditDrawer(false)}
              className="px-6 py-3 border rounded-2xl hover:bg-gray-100 transition-all duration-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 cursor-pointer"
            >
              Update Batch
            </button>
          </div>
        </form>
      </FormDrawer>
    </DashboardLayout>
  );
}

export default BatchesPage;
