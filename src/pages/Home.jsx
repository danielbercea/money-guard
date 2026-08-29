import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

import "./Home.css";

import background from "../assets/dashboard/background.svg";
import headerBg from "../assets/dashboard/header-bg.png";
import homeIcon from "../assets/dashboard/home.svg";
import statisticsIcon from "../assets/dashboard/statistics.svg";
import exitIcon from "../assets/dashboard/exit.svg";
import logo from "../assets/dashboard/logo.svg";
import editIcon from "../assets/dashboard/edit.svg";
import plusIcon from "../assets/dashboard/plus.svg";
import chartFill from "../assets/dashboard/chart-fill.svg";
import chartLine from "../assets/dashboard/chart-line.svg";

const categories = [
  "Main expenses",
  "Products",
  "Car",
  "Self care",
  "Child care",
  "Household products",
  "Education",
  "Leisure",
  "Entertainment",
  "Other expenses",
  "Other",
];

function createEmptyForm() {
  return {
    type: "income",
    category: "Products",
    comment: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  };
}

function Home() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(createEmptyForm());

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    try {
      setError("");

      const [userData, transactionData] = await Promise.all([
        apiRequest("/auth/me"),
        apiRequest("/transactions"),
      ]);

      setUser(userData.user);
      setTransactions(transactionData.transactions);
    } catch (error) {
      setError(error.message);
    }
  }

  async function loadTransactions() {
    try {
      const data = await apiRequest("/transactions");

      setTransactions(data.transactions);
    } catch (error) {
      setError(error.message);
    }
  }

  function openAddModal() {
    setEditingId(null);
    setForm(createEmptyForm());
    setError("");
    setModalOpen(true);
  }

  function openEditModal(transaction) {
    setEditingId(transaction._id);

    setForm({
      type: transaction.type,
      category:
        transaction.type === "income" ? "Products" : transaction.category,
      comment: transaction.comment || "",
      amount: transaction.amount,
      date: transaction.date.split("T")[0],
    });

    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(createEmptyForm());
    setError("");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function changeType(type) {
    setForm((previous) => ({
      ...previous,
      type,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Introdu o sumă mai mare decât 0.");
      return;
    }

    if (!form.date) {
      setError("Selectează data.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        type: form.type,
        category: form.type === "income" ? "Income" : form.category,
        comment: form.comment,
        amount: Number(form.amount),
        date: form.date,
      };

      if (editingId) {
        await apiRequest(`/transactions/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest("/transactions", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      await loadTransactions();

      closeModal();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Sigur vrei să ștergi această tranzacție?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiRequest(`/transactions/${id}`, {
        method: "DELETE",
      });

      await loadTransactions();
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleLogout() {
    try {
      await apiRequest("/auth/logout", {
        method: "POST",
      });
    } finally {
      navigate("/login");
    }
  }

  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const balance = income - expenses;

  function formatAmount(value) {
    return Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function formatDate(value) {
    const date = new Date(value);

    return date.toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  }

  return (
    <main className="dashboard">
      <img src={background} alt="" className="dashboard-background" />

      <header className="dashboard-header">
        <img src={headerBg} alt="" className="dashboard-header-background" />

        <div className="dashboard-logo">
          <img src={logo} alt="" />

          <span>Money Guard</span>
        </div>

        <div className="dashboard-user">
          <span>{user?.name || "Name"}</span>

          <div className="dashboard-user-divider" />

          <button
            type="button"
            className="dashboard-exit"
            onClick={handleLogout}
          >
            <img src={exitIcon} alt="" />

            <span>Exit</span>
          </button>
        </div>
      </header>

      <aside className="dashboard-sidebar">
        <nav className="dashboard-navigation">
          <Link to="/home" className="dashboard-nav-item active">
            <img src={homeIcon} alt="" />

            <span>Home</span>
          </Link>

          <Link to="/statistics" className="dashboard-nav-item">
            <img src={statisticsIcon} alt="" />

            <span>Statistics</span>
          </Link>
        </nav>

        <section className="balance-box">
          <span className="balance-label">YOUR BALANCE</span>

          <div className="balance-value">
            <span>₴</span>

            <strong>{formatAmount(balance)}</strong>
          </div>
        </section>

        <section className="currency-box">
          <div className="currency-heading">
            <span>Currency</span>
            <span>Purchase</span>
            <span>Sale</span>
          </div>

          <div className="currency-row">
            <span>USD</span>
            <span>27.55</span>
            <span>27.65</span>
          </div>

          <div className="currency-row">
            <span>EUR</span>
            <span>30.00</span>
            <span>30.10</span>
          </div>

          <div className="currency-chart">
            <img src={chartFill} alt="" className="currency-chart-fill" />

            <img src={chartLine} alt="" className="currency-chart-line" />

            <span className="currency-point currency-point-left">27.55</span>

            <span className="currency-point currency-point-right">30.00</span>
          </div>
        </section>
      </aside>

      <section className="transactions-area">
        {error && !modalOpen && <div className="dashboard-error">{error}</div>}

        <div className="transactions-table">
          <div className="transaction-row transaction-heading">
            <div>Date</div>
            <div>Type</div>
            <div>Category</div>
            <div>Comment</div>
            <div>Sum</div>
            <div />
          </div>

          {transactions.length === 0 && (
            <div className="empty-transactions">No transactions yet</div>
          )}

          {transactions.map((transaction) => (
            <div
              className="transaction-row transaction-data"
              key={transaction._id}
            >
              <div>{formatDate(transaction.date)}</div>

              <div className="transaction-type">
                {transaction.type === "income" ? "+" : "−"}
              </div>

              <div>{transaction.category}</div>

              <div className="transaction-comment">
                {transaction.comment || "—"}
              </div>

              <div
                className={
                  transaction.type === "income"
                    ? "transaction-sum income"
                    : "transaction-sum expense"
                }
              >
                {formatAmount(transaction.amount)}
              </div>

              <div className="transaction-actions">
                <button
                  type="button"
                  className="transaction-edit"
                  onClick={() => openEditModal(transaction)}
                  aria-label="Edit transaction"
                >
                  <img src={editIcon} alt="" />
                </button>

                <button
                  type="button"
                  className="transaction-delete"
                  onClick={() => handleDelete(transaction._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <button
        type="button"
        className="dashboard-add"
        onClick={openAddModal}
        aria-label="Add transaction"
      >
        <img src={plusIcon} alt="" />
      </button>

      {modalOpen && (
        <div className="transaction-modal-overlay">
          <div className="transaction-modal">
            <button
              type="button"
              className="transaction-modal-close"
              onClick={closeModal}
              aria-label="Close"
            >
              ×
            </button>

            <h2>{editingId ? "Edit transaction" : "Add transaction"}</h2>

            <form onSubmit={handleSubmit}>
              <div className="transaction-type-selector">
                <button
                  type="button"
                  className={
                    form.type === "income"
                      ? "transaction-type-label selected"
                      : "transaction-type-label"
                  }
                  onClick={() => changeType("income")}
                >
                  Income
                </button>

                <button
                  type="button"
                  className="transaction-switch"
                  onClick={() =>
                    changeType(form.type === "income" ? "expense" : "income")
                  }
                  aria-label="Switch transaction type"
                >
                  <span
                    className={
                      form.type === "expense"
                        ? "transaction-switch-circle expense"
                        : "transaction-switch-circle"
                    }
                  >
                    +
                  </span>
                </button>

                <button
                  type="button"
                  className={
                    form.type === "expense"
                      ? "transaction-type-label selected"
                      : "transaction-type-label"
                  }
                  onClick={() => changeType("expense")}
                >
                  Expense
                </button>
              </div>

              <div className="transaction-form-row">
                <div className="modal-field amount-field">
                  <input
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={handleChange}
                  />
                </div>

                <div className="modal-field date-field">
                  <input
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    lang="ro-RO"
                  />
                </div>
              </div>

              {form.type === "expense" && (
                <div className="modal-field modal-category">
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="modal-field modal-comment">
                <input
                  name="comment"
                  type="text"
                  placeholder="Comment"
                  value={form.comment}
                  onChange={handleChange}
                />
              </div>

              {error && <div className="modal-error">{error}</div>}

              <div className="transaction-modal-buttons">
                <button
                  type="submit"
                  className="modal-save-button"
                  disabled={saving}
                >
                  {saving ? "SAVING..." : editingId ? "SAVE" : "ADD"}
                </button>

                <button
                  type="button"
                  className="modal-cancel-button"
                  onClick={closeModal}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Home;
