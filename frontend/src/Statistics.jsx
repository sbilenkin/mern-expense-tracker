import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import SpendingChart from './SpendingChart';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function Statistics() {
  const { user, authFetch, logout, isLoggedIn, isAdmin } = useAuth();
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    try {
      const reqString = isAdmin
        ? 'http://localhost:5000/transactions'
        : `http://localhost:5000/transactions/${user.username}`;

      const response = await authFetch(reqString);

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchTransactions();
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    logout();
  };

  // Calculate additional statistics
  const calculateStats = () => {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const thisMonthTransactions = transactions.filter(t => new Date(t.date) >= thisMonth);
    const lastMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= lastMonth && date <= lastMonthEnd;
    });

    const thisMonthIncome = thisMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const thisMonthExpenses = thisMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const avgDailySpending = thisMonthExpenses / new Date().getDate();

    return {
      thisMonthIncome,
      thisMonthExpenses,
      thisMonthNet: thisMonthIncome - thisMonthExpenses,
      lastMonthExpenses,
      expenseChange: lastMonthExpenses > 0 ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0,
      avgDailySpending,
      totalTransactions: transactions.length
    };
  };

  const stats = calculateStats();

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="Statistics">
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Expense Tracker</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link" href="/">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="#">Statistics</a>
              </li>
              {isAdmin && (
                <li className="nav-item">
                  <a className="nav-link" href="/user-management">Manage Users</a>
                </li>
              )}
              <li className="nav-item">
                <a className="nav-link btn btn-primary add-transactions" href="/add-transactions">Add Transactions</a>
              </li>
            </ul>
            <button className="btn btn-primary ms-auto" onClick={handleLogout}>Log Out</button>
          </div>
        </div>
      </nav>

      <div className="statistics-container">
        <h2 className="page-title">Your Financial Statistics</h2>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <h4>This Month Income</h4>
            <div className="stat-value income">${stats.thisMonthIncome.toFixed(2)}</div>
          </div>

          <div className="stat-card">
            <h4>This Month Expenses</h4>
            <div className="stat-value expense">${stats.thisMonthExpenses.toFixed(2)}</div>
          </div>

          <div className="stat-card">
            <h4>Net This Month</h4>
            <div className={`stat-value ${stats.thisMonthNet >= 0 ? 'income' : 'expense'}`}>
              ${stats.thisMonthNet.toFixed(2)}
            </div>
          </div>

          <div className="stat-card">
            <h4>Avg Daily Spending</h4>
            <div className="stat-value">${stats.avgDailySpending.toFixed(2)}</div>
          </div>

          <div className="stat-card">
            <h4>vs Last Month</h4>
            <div className={`stat-value ${stats.expenseChange > 0 ? 'expense' : 'income'}`}>
              {stats.expenseChange > 0 ? '+' : ''}{stats.expenseChange.toFixed(1)}%
            </div>
          </div>

          <div className="stat-card">
            <h4>Total Transactions</h4>
            <div className="stat-value">{stats.totalTransactions}</div>
          </div>
        </div>

        {/* Spending Chart */}
        <div className="chart-section">
          <SpendingChart transactions={transactions} />
        </div>
      </div>
    </div>
  );
}

export default Statistics;