import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

import { apiRequest } from "../services/api";

import userIcon from "../assets/register/user.svg";
import emailIcon from "../assets/register/email.svg";
import lockIcon from "../assets/register/lock.svg";
import logoIcon from "../assets/register/logo.svg";
import moneyLeft from "../assets/register/money-left.png";
import moneyRight from "../assets/register/money-right.png";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Completează toate câmpurile.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Parolele nu coincid.");
      return;
    }

    try {
      setLoading(true);

      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
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
    <main className="register-page">
      <div className="register-glow register-glow-left" />
      <div className="register-glow register-glow-right" />

      <img
        src={moneyLeft}
        alt=""
        className="register-money register-money-left"
      />

      <img
        src={moneyRight}
        alt=""
        className="register-money register-money-right"
      />

      <section className="register-card">
        <div className="register-logo">
          <img src={logoIcon} alt="" />
          <h1>Money Guard</h1>
        </div>

        {error && <div className="register-error">{error}</div>}

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="register-field">
            <img src={userIcon} alt="" />

            <input
              name="name"
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          <div className="register-field">
            <img src={emailIcon} alt="" />

            <input
              name="email"
              type="email"
              placeholder="E-mail"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="register-field">
            <img src={lockIcon} alt="" />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          <div className="register-field register-field-confirm">
            <img src={lockIcon} alt="" />

            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>

          <Link to="/login" className="register-login-button">
            Log in
          </Link>
        </form>
      </section>
    </main>
  );
}

export default Register;
