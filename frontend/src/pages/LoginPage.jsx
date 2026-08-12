import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import FormInput from "../components/forms/FormInput";
import { ROUTES } from "../constants/routes";
function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    //e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post("/auth/login", formData);
      console.log(response.data);
      login({
        user: response.data.user,
        token: response.data.token,
      });

      if (response.data.user.role === "admin") {
        navigate(ROUTES.ADMIN_DASHBOARD);
      }

      if (response.data.user.role === "mentor") {
        navigate(ROUTES.MENTOR_DASHBOARD);
      }

      if (response.data.user.role === "mentee") {
        navigate(ROUTES.MENTEE_DASHBOARD);
      }
    } catch (error) {
      console.error(error);

      alert(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-600 via-blue-500 to-cyan-400 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">DLM</h1>

          <p className="text-gray-500 mt-2">Pronunciation Assistant</p>
        </div>

        <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">
          <FormInput
            label="Email"
            type="email"
            name="email"
            register={register}
            value={formData.email}
            fnOnChange={handleChange}
          />
          <FormInput
            label="Password"
            type="password"
            name="password"
            register={register}
            value={formData.password}
            fnOnChange={handleChange}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 text-white font-semibold py-3 rounded-xl shadow-lg"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
