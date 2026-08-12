import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Trash2, Pencil, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import SearchInput from "../../components/SearchInput";
import DataTable from "../../components/DataTable";
import ConfirmModal from "../../components/ConfirmModal";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import FormInput from "../../components/forms/FormInput";
import FormDrawer from "../../components/common/FormDrawer";
import PageActions from "../../components/common/PageActions";
import PrimaryButton from "../../components/common/PrimaryButton";
import Loader from "../../components/Loader";
import EmptyState from "../../components/common/EmptyState";

function MentorsPage() {
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
  const [mentors, setMentors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [editingMentor, setEditingMentor] = useState(null);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const onSubmit = async (data) => {
    try {
      await api.post("/users", {
        ...data,
        role: "mentor",
      });

      toast.success("Mentor created successfully");

      reset();
      setShowCreateDrawer(false);
      fetchMentors();
    } catch (error) {
      console.error(error);

      toast.error(error?.response?.data?.message || "Failed to create mentor");
    }
  };
  const filteredMentors = mentors.filter(
    (mentor) =>
      mentor.name.toLowerCase().includes(search.toLowerCase()) ||
      mentor.email.toLowerCase().includes(search.toLowerCase()),
  );
  const handleDelete = async () => {
    try {
      await api.delete(`/users/${selectedMentor.id}`);

      toast.success("Mentor deleted");

      setDeleteModal(false);

      fetchMentors();
    } catch (error) {
      console.error(error);

      toast.error("Delete failed");
    }
  };
  const handleEdit = (mentor) => {
    setEditingMentor(mentor);
    resetEditForm({
      name: mentor.name,
      email: mentor.email,
    });

    setShowEditDrawer(true);
  };
  const onEditSubmit = async (data) => {
    try {
      await api.put(`/users/${editingMentor.id}`, data);

      toast.success("Mentor updated successfully");
      setShowEditDrawer(false);
      fetchMentors();
    } catch (error) {
      console.error(error);

      toast.error("Update failed");
    }
  };
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
      key: "role",
      label: "Role",
    },
    {
      key: "actions",
      label: "Actions",
      render: (mentor) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleEdit(mentor)}
            className="w-10 h-10 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 cursor-pointer"
          >
            <Pencil size={18} className="text-blue-600" />
          </button>

          <button
            onClick={() => {
              setSelectedMentor(mentor);

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
        title="Mentors"
        description="Manage mentor accounts and access"
      />
      <PageActions>
        <PrimaryButton
          onClick={() => {
            reset();
            setShowCreateDrawer(true);
          }}
        >
          + Create Mentor
        </PrimaryButton>
      </PageActions>
      <div className="">
        <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-semibold">
              {mentors.length} Total
            </div>
          </div>

          {loading ? (
            <Loader text="Loading mentors..." />
          ) : filteredMentors.length === 0 ? (
            <EmptyState
              title="No mentors found"
              description="Try adjusting your search or create a new mentor."
              icon={Users}
              buttonText="Create Mentor"
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
                  placeholder="Search mentors..."
                />
              </div>
              <DataTable
                columns={columns}
                data={filteredMentors}
                loading={loading}
                emptyMessage="No mentors found"
              />
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal}
        title="Delete Mentor"
        message="Are you sure you want to delete this mentor?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(false)}
      />
      <FormDrawer
        open={showCreateDrawer}
        title="Create Mentor"
        onClose={() => setShowCreateDrawer(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormInput
            label="Name"
            register={register}
            name="name"
            errors={errors}
            validation={{ required: "Name is required" }}
          />
          <FormInput
            label="Email"
            type="email"
            register={register}
            name="email"
            errors={errors}
            validation={{ required: "Email is required" }}
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
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer"
          >
            Create Mentor
          </button>
        </form>
      </FormDrawer>
      <FormDrawer
        open={showEditDrawer}
        title="Edit Mentor"
        onClose={() => setShowEditDrawer(false)}
      >
        <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-5">
          <FormInput
            label="Name"
            register={editRegister}
            name="name"
            errors={editErrors}
            validation={{ required: "Name is required" }}
          />
          <FormInput
            label="Email"
            type="email"
            register={editRegister}
            name="email"
            errors={editErrors}
            validation={{ required: "Email is required" }}
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer"
          >
            Update Mentor
          </button>
        </form>
      </FormDrawer>
    </DashboardLayout>
  );
}

export default MentorsPage;
