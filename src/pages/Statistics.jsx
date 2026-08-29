import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

import "./Statistics.css";

import background from "../assets/dashboard/background.svg";
import headerBg from "../assets/dashboard/header-bg.png";
import homeIcon from "../assets/dashboard/home.svg";
import statisticsIcon from "../assets/dashboard/statistics.svg";
import exitIcon from "../assets/dashboard/exit.svg";
import logo from "../assets/dashboard/logo.svg";
import chartFill from "../assets/dashboard/chart-fill.svg";
import chartLine from "../assets/dashboard/chart-line.svg";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const categoryColors = {
  "Main expenses": "#fed057",
  Products: "#ffd8d0",
  Car: "#fd9498",
  "Self care": "#c5baff",
  "Child care": "#6e78e8",
  "Household products": "#4a56e2",
  Education: "#81e1ff",
  Leisure: "#24cca7",
  "Other expenses": "#00ad84",
  Entertainment: "#00ad84",
  Other: "#00ad84",
};

const categoryOrder = [
  "Main expenses",
  "Products",
  "Car",
  "Self care",
  "Child care",
  "Household products",
  "Education",
  "Leisure",
  "Other expenses",
];

function Statistics() {
  const navigate = useNavigate();

  const now = new Date();

  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [error, setError] = useState("");

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

  async function handleLogout() {
    try {
      await apiRequest("/auth/logout", {
        method: "POST",
      });
    } finally {
      navigate("/login");
    }
  }

  const years = useMemo(() => {
    const yearSet = new Set();

    yearSet.add(now.getFullYear());

    for (let year = 2020; year <= now.getFullYear(); year += 1) {
      yearSet.add(year);
    }

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);

      if (!Number.isNaN(date.getTime())) {
        yearSet.add(date.getUTCFullYear());
      }
    });

    return [...yearSet].sort((a, b) => b - a);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const date = new Date(transaction.date);

      if (Number.isNaN(date.getTime())) {
        return false;
      }

      return (
        date.getUTCMonth() === Number(selectedMonth) &&
        date.getUTCFullYear() === Number(selectedYear)
      );
    });
  }, [transactions, selectedMonth, selectedYear]);

  const totalBalance = useMemo(() => {
    const income = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + Number(transaction.amount), 0);

    const expenses = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + Number(transaction.amount), 0);

    return income - expenses;
  }, [transactions]);

  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + Number(transaction.amount), 0);
  }, [filteredTransactions]);

  const totalExpenses = useMemo(() => {
    return filteredTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + Number(transaction.amount), 0);
  }, [filteredTransactions]);

  const categoryData = useMemo(() => {
    const totals = {};

    filteredTransactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        let category = transaction.category;

        if (category === "Other" || category === "Entertainment") {
          category = "Other expenses";
        }

        if (!totals[category]) {
          totals[category] = 0;
        }

        totals[category] += Number(transaction.amount);
      });

    return categoryOrder.map((category) => ({
      category,
      total: totals[category] || 0,
      color: categoryColors[category],
    }));
  }, [filteredTransactions]);

  const donutBackground = useMemo(() => {
    if (totalExpenses <= 0) {
      return "conic-gradient(rgba(255, 255, 255, 0.12) 0deg 360deg)";
    }

    let start = 0;

    const sections = categoryData
      .filter((item) => item.total > 0)
      .map((item) => {
        const degrees = (item.total / totalExpenses) * 360;

        const end = start + degrees;

        const section = `${item.color} ${start}deg ${end}deg`;

        start = end;

        return section;
      });

    if (sections.length === 0) {
      return "conic-gradient(rgba(255, 255, 255, 0.12) 0deg 360deg)";
    }

    return `conic-gradient(${sections.join(", ")})`;
  }, [categoryData, totalExpenses]);

  function formatAmount(value) {
    return Number(value)
      .toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      .replace(/,/g, " ");
  }

  return (
    <main className="statistics-page">
      <img src={background} alt="" className="statistics-background" />

      <header className="statistics-header">
        <img src={headerBg} alt="" className="statistics-header-background" />

        <div className="statistics-logo">
          <img src={logo} alt="" />
          <span>Money Guard</span>
        </div>

        <div className="statistics-user">
          <span>{user?.name || "Name"}</span>

          <div className="statistics-user-divider" />

          <button
            type="button"
            className="statistics-exit"
            onClick={handleLogout}
          >
            <img src={exitIcon} alt="" />
            <span>Exit</span>
          </button>
        </div>
      </header>

      <aside className="statistics-sidebar">
        <nav className="statistics-navigation">
          <Link to="/home" className="statistics-nav-item">
            <img src={homeIcon} alt="" />
            <span>Home</span>
          </Link>

          <Link to="/statistics" className="statistics-nav-item active">
            <img src={statisticsIcon} alt="" />
            <span>Statistics</span>
          </Link>
        </nav>

        <section className="statistics-balance">
          <span className="statistics-balance-label">YOUR BALANCE</span>

          <div className="statistics-balance-value">
            <span>₴</span>

            <strong>{formatAmount(totalBalance)}</strong>
          </div>
        </section>

        <section className="statistics-currency">
          <div className="statistics-currency-header">
            <span>Currency</span>
            <span>Purchase</span>
            <span>Sale</span>
          </div>

          <div className="statistics-currency-row">
            <span>USD</span>
            <span>27.55</span>
            <span>27.65</span>
          </div>

          <div className="statistics-currency-row">
            <span>EUR</span>
            <span>30.00</span>
            <span>30.10</span>
          </div>

          <div className="statistics-currency-chart">
            <img src={chartFill} alt="" className="statistics-chart-fill" />

            <img src={chartLine} alt="" className="statistics-chart-line" />

            <span className="statistics-chart-value value-left">27.55</span>

            <span className="statistics-chart-value value-right">30.00</span>
          </div>
        </section>
      </aside>

      <section className="statistics-content">
        <h1>Statistics</h1>

        {error && <div className="statistics-error">{error}</div>}

        <div className="statistics-layout">
          <div className="statistics-donut-column">
            <div
              className="statistics-donut"
              style={{
                background: donutBackground,
              }}
            >
              <div className="statistics-donut-hole">
                <span>₴ {formatAmount(totalBalance)}</span>
              </div>
            </div>
          </div>

          <div className="statistics-details">
            <div className="statistics-filters">
              <div className="statistics-select-wrapper">
                <select
                  value={selectedMonth}
                  onChange={(event) =>
                    setSelectedMonth(Number(event.target.value))
                  }
                >
                  {months.map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div className="statistics-select-wrapper">
                <select
                  value={selectedYear}
                  onChange={(event) =>
                    setSelectedYear(Number(event.target.value))
                  }
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="statistics-table">
              <div className="statistics-table-header">
                <span>Category</span>
                <span>Sum</span>
              </div>

              <div className="statistics-category-list">
                {categoryData.map((item) => (
                  <div className="statistics-category-row" key={item.category}>
                    <div className="statistics-category-name">
                      <span
                        className="statistics-category-color"
                        style={{
                          backgroundColor: item.color,
                        }}
                      />

                      <span>{item.category}</span>
                    </div>

                    <span className="statistics-category-sum">
                      {formatAmount(item.total)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="statistics-totals">
                <div className="statistics-total-row">
                  <span>Expenses:</span>

                  <strong className="statistics-expenses">
                    {formatAmount(totalExpenses)}
                  </strong>
                </div>

                <div className="statistics-total-row">
                  <span>Income:</span>

                  <strong className="statistics-income">
                    {formatAmount(totalIncome)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Statistics;
