import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import LoginPage from './pages/LoginPage';

import AdminDashboard from './pages/AdminDashboard';
import MentorDashboard from './pages/MentorDashboard';
import MenteeDashboard from './pages/MenteeDashboard';

import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<LoginPage />}
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute
              allowedRoles={['admin']}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor"
          element={
            <ProtectedRoute
              allowedRoles={['mentor']}
            >
              <MentorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentee"
          element={
            <ProtectedRoute
              allowedRoles={['mentee']}
            >
              <MenteeDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;