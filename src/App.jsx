import { Navigate, Route, Routes } from "react-router-dom";

import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Statistics from "./pages/Statistics";

import { apiRequest } from "./services/api";

import "./App.css";

function ProtectedRoute({ children }) {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        await apiRequest("/auth/me");

        setAuthenticated(true);
      } catch {
        setAuthenticated(false);
      }
    }

    checkAuth();
  }, []);

  if (authenticated === null) {
    return <div className="loading-page">Loading...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/statistics"
        element={
          <ProtectedRoute>
            <Statistics />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
