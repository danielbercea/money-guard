import { Link, useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";

import { apiRequest } from "../services/api";

function Header() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await apiRequest("/auth/me");

        setUser(data.user);
      } catch {
        navigate("/login");
      }
    }

    loadUser();
  }, [navigate]);

  async function handleLogout() {
    try {
      await apiRequest("/auth/logout", {
        method: "POST",
      });
    } finally {
      navigate("/login");
    }
  }

  return (
    <header className="header">
      <h2>Money Guard</h2>

      <nav className="navigation">
        <Link to="/home">Home</Link>

        <Link to="/statistics">Statistics</Link>
      </nav>

      <div className="header-user">
        <span>{user?.name}</span>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
