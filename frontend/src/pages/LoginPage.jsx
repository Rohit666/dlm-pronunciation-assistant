import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

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
    e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post(
  '/auth/login',
  formData
);

     login(
  response.data.user,
  response.data.token
);

if (response.data.user.role === 'admin') {
  navigate('/admin');
}

if (response.data.user.role === 'mentor') {
  navigate('/mentor');
}

if (response.data.user.role === 'mentee') {
  navigate('/mentee');
}

    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
        'Login failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-600 via-blue-500 to-cyan-400 p-4">
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            DLM
          </h1>

          <p className="text-gray-500 mt-2">
            Pronunciation Assistant
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 text-white font-semibold py-3 rounded-xl shadow-lg"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;