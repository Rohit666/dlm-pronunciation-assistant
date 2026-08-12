import { useEffect, useState } from "react";
import { Trash2, Users, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/PageHeader";
import StatsCard from "../../components/StatsCard";
import SearchInput from "../../components/SearchInput";
import DataTable from "../../components/DataTable";
import ConfirmModal from "../../components/ConfirmModal";
import SelectField from "../../components/forms/SelectField";
import FormInput from "../../components/forms/FormInput";
import api from "../../services/api";
import FormSelect from "../../components/forms/FormSelect";
import FormDrawer from "../../components/common/FormDrawer";
import PageActions from "../../components/common/PageActions";
import PrimaryButton from "../../components/common/PrimaryButton";
import Loader from "../../components/Loader";
import EmptyState from "../../components/common/EmptyState";
function MenteesPage() {
  const [mentees, setMentees] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState(null);
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

  const fetchMentees = async () => {
    try {
      const response = await api.get("/mentees");

      setMentees(response.data.mentees);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load mentees");
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await api.get("/batches");

      setBatches(response.data.batches);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load batches");
    }
  };

  useEffect(() => {
    fetchMentees();

    fetchBatches();
  }, []);

  const filteredMentees = mentees.filter(
    (mentee) =>
      mentee.User?.name?.toLowerCase().includes(search.toLowerCase()) ||
      mentee.User?.email?.toLowerCase().includes(search.toLowerCase()) ||
      mentee.roll_number?.toLowerCase().includes(search.toLowerCase()),
  );

  const onSubmit = async (data) => {
    try {
      await api.post("/mentees", data);
      toast.success("Mentee created successfully");
      reset();
      setShowCreateDrawer(false);
      fetchMentees();
    } catch (error) {
      console.error(error);

      toast.error(error?.response?.data?.message || "Failed to create mentee");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/mentees/${selectedMentee.id}`);

      toast.success("Mentee deleted successfully");

      setDeleteModal(false);

      fetchMentees();
    } catch (error) {
      console.error(error);

      toast.error("Failed to delete mentee");
    }
  };
  const handleEdit = (mentee) => {
    setSelectedMentee(mentee);

    resetEditForm({
      name: mentee.User.name,
      email: mentee.User.email,
      roll_number: mentee.roll_number,
      batch_id: mentee.batch_id,
    });

    setShowEditDrawer(true);
  };
  const onEditSubmit = async (data) => {
    try {
      await api.put(`/mentees/${selectedMentee.id}`, data);
      toast.success("Mentee updated successfully");
      setShowEditDrawer(false);
      fetchMentees();
    } catch (error) {
      console.error(error);

      toast.error("Failed to update mentee");
    }
  };
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
    {
      key: "batch",
      label: "Batch",
      render: (mentee) => mentee.Batch?.batch_name || "-",
    },
    {
      key: "actions",
      label: "Actions",
      render: (mentee) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleEdit(mentee)}
            className="w-10 h-10 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 cursor-pointer"
          >
            <Pencil size={18} className="text-blue-600" />
          </button>
          <button
            onClick={() => {
              setSelectedMentee(mentee);

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
        title="Mentees"
        description="Manage mentees and assign batches"
      />
      <PageActions>
        <PrimaryButton
          onClick={() => {
            reset();
            setShowCreateDrawer(true);
          }}
        >
          + Create Mentee
        </PrimaryButton>
      </PageActions>
      <div className="">
        <div className="xl:col-span-2 space-y-6">
          <StatsCard
            title="Total Mentees"
            value={mentees.length}
            icon={Users}
          />
          <div className="bg-white rounded-3xl shadow-sm p-6">
            {loading ? (
              <Loader text="Loading mentees..." />
            ) : filteredMentees.length === 0 ? (
              <EmptyState
                title="No Mentees Yet"
                description="
      Create your first mentee
      to get started.
    "
                buttonText="Create Mentee"
                onAction={() => setShowCreateDrawer(true)}
              />
            ) : (
              <div className="overflow-x-auto">
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
                  emptyMessage="No mentees found"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={deleteModal}
        title="Delete Mentee"
        message="Are you sure you want to delete this mentee?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(false)}
      />
      <FormDrawer
        open={showCreateDrawer}
        title="Create Mentee"
        onClose={() => setShowCreateDrawer(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormInput
            label="Name"
            type="text"
            register={register}
            name="name"
            errors={errors}
            validation={{
              required: "Name is required",
            }}
          />
          <FormInput
            label="Email"
            type="email"
            register={register}
            name="email"
            errors={errors}
            validation={{
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Invalid email address",
              },
            }}
          />
          <FormInput
            label="Password"
            type="password"
            register={register}
            name="password"
            errors={errors}
            validation={{
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            }}
          />
          <FormInput
            label="Roll Number"
            type="text"
            register={register}
            name="roll_number"
            errors={errors}
          />
          <FormSelect
            label="Batch"
            register={register}
            name="batch_id"
            errors={errors}
            options={batches.map((batch) => ({
              value: batch.id,
              label: batch.batch_name,
            }))}
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer"
          >
            Create Mentee
          </button>
        </form>
      </FormDrawer>
      <FormDrawer
        open={showEditDrawer}
        title="Edit Mentee"
        onClose={() => setShowEditDrawer(false)}
      >
        <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-5">
          <FormInput
            label="Name"
            type="text"
            register={editRegister}
            name="name"
            errors={editErrors}
            validation={{
              required: "Name is required",
            }}
          />
          <FormInput
            label="Email"
            type="email"
            register={editRegister}
            name="email"
            errors={editErrors}
            validation={{
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Invalid email address",
              },
            }}
          />
          <FormInput
            label="Roll Number"
            type="text"
            register={editRegister}
            name="roll_number"
            errors={editErrors}
          />
          <FormSelect
            label="Batch"
            register={editRegister}
            name="batch_id"
            errors={editErrors}
            options={batches.map((batch) => ({
              value: batch.id,
              label: batch.batch_name,
            }))}
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer"
          >
            Update Mentee
          </button>
        </form>
      </FormDrawer>
    </DashboardLayout>
  );
}

export default MenteesPage;
