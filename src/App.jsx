import { Link, Navigate, Route, Routes } from "react-router-dom";

import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Statistics from "./pages/Statistics";

import { apiRequest } from "./services/api";

import "./App.css";

const SESSION_CHECK_TIMEOUT_MS = 10_000;

function ProtectedRoute({ children }) {
  const [session, setSession] = useState("checking");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      setSession("unavailable");
    }, SESSION_CHECK_TIMEOUT_MS);

    async function checkAuth() {
      try {
        const data = await apiRequest("/auth/me", { signal: controller.signal });
        if (!controller.signal.aborted) {
          setSession(data.user ? "authenticated" : "unavailable");
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setSession(
            error.status === 401 || error.status === 404
              ? "signed-out"
              : "unavailable",
          );
        }
      } finally {
        clearTimeout(timeout);
      }
    }

    checkAuth();
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  if (session === "signed-out") {
    return <Navigate to="/login" replace />;
  }

  if (session === "authenticated") {
    return children;
  }

  function retry() {
    setSession("checking");
    setAttempt((value) => value + 1);
  }

  return (
    <main className="loading-page">
      <div>
        <p role="status">
          {session === "checking"
            ? "Connecting to Money Guard..."
            : "The server is taking longer than expected. Try again in a moment."}
        </p>
        {session === "unavailable" && (
          <button type="button" onClick={retry}>
            Try again
          </button>
        )}{" "}
        <Link to="/login">Go to login</Link>
      </div>
    </main>
  );
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
