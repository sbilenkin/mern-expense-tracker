import React, { useState } from 'react'
import Transaction from './Transaction'
import './index.css'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useEffect } from 'react';

function Home({ loggedIn, username, isAdmin }) {
  const [transactions, setTransactions] = useState([]);

  const calculateBalance = () => {
    const balance = transactions.reduce((total, transaction) => {
      return transaction.type === 'income'
        ? total + transaction.amount
        : total - transaction.amount;
    }, 0);
    return (balance < 0 ? ("-$" + Math.abs(balance.toFixed(2))) : ("$" + balance.toFixed(2)));
  };

  const calculateMonthlyExpenses = () => {
    const curMonth = new Date().getMonth();
    const curYear = new Date().getFullYear();
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transaction.type === 'expense' &&
        transactionDate.getMonth() === curMonth &&
        transactionDate.getFullYear() === curYear;
    })
      .reduce((total, transaction) => {
        return total + transaction.amount;
      }, 0).toFixed(2);
  };

  const fetchTransactions = async () => {
    if (loggedIn && username) {
      try {
        const reqString = isAdmin ? 'http://localhost:5000/transactions' : `http://localhost:5000/transactions/${username}`;  
        const response = await fetch(reqString, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setTransactions(data.transactions || []);
        } else {
          console.error("Failed to fetch transactions");
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [loggedIn, username]);

  const handleLogout = () => {
    sessionStorage.removeItem('loggedIn');
    sessionStorage.removeItem('username');
    window.location.href = '/login';
  };

  const onEdit = async (id, updatedData) => {
    try {
      const response = await fetch(`http://localhost:5000/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      if (response.ok) {
        const updatedTransaction = await response.json();
        setTransactions(prev =>
          prev.map(t => t._id === updatedTransaction.transaction._id
            ? updatedTransaction.transaction
            : t
          )
        );
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  const onDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setTransactions(prev => prev.filter(t => t._id !== id));
      } else {
        console.error("Failed to delete transaction");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  return (
    <div className="Home">
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Expense Tracker</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="#">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link btn btn-primary add-transactions" aria-current="page" href="/add-transactions">Add Transactions</a>
              </li>
            </ul>
            <button id="logout-button" className="btn btn-primary ms-auto" onClick={handleLogout}>Log Out</button>
          </div>
        </div>
      </nav>
      {!isAdmin && (
        <div className="dashboard">
          <div className="dashboard-box">
            <h3>Current Balance</h3>
            <div className="dashboard-value">{calculateBalance()}</div>
          </div>
          <div className="dashboard-box">
            <h3>Total Expenses This Month</h3>
            <div className="dashboard-value">${calculateMonthlyExpenses()}</div>
          </div>
        </div>
      )}
      <ul className="recent-transactions list-group">
        {transactions.map((transaction) => (<Transaction key={transaction._id} transaction={transaction} onEdit={onEdit} onDelete={onDelete} isAdmin={isAdmin} />))}
      </ul>
    </div>
  )
}

export default Home