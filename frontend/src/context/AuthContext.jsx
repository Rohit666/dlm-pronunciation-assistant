import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      // setUser(JSON.parse(storedUser));
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Invalid user in localStorage:", storedUser);

        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    setLoading(false);
  }, []);

  const login = ({ user, token }) => {
    localStorage.setItem("token", token);

    localStorage.setItem("user", JSON.stringify(user));

    setToken(token);

    setUser(user);
  };

  const logout = () => {
    localStorage.clear();

    setToken(null);

    setUser(null);

    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
