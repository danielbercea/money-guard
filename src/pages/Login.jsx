import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

import "./Login.css";

import coinsLeft from "../assets/login/coins-left.png";
import coinsRight from "../assets/login/coins-right.png";
import logo from "../assets/login/logo.svg";
import emailIcon from "../assets/login/email.svg";
import lockIcon from "../assets/login/lock.svg";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Completează e-mailul și parola.");
      return;
    }

    try {
      setLoading(true);

      await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      navigate("/home");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-background">
        <img src={coinsLeft} alt="" className="login-coins login-coins-left" />

        <img
          src={coinsRight}
          alt=""
          className="login-coins login-coins-right"
        />

        <div className="login-glow login-glow-left"></div>
        <div className="login-glow login-glow-right"></div>
        <div className="login-glow login-glow-bottom"></div>
      </div>

      <section className="login-card">
        <div className="login-logo">
          <img src={logo} alt="Money Guard" />

          <h1>Money Guard</h1>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="login-field">
            <img src={emailIcon} alt="" />

            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <img src={lockIcon} alt="" />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </div>

          <div className="login-buttons">
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "LOADING..." : "LOG IN"}
            </button>

            <Link to="/register" className="register-button">
              REGISTER
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Login;
