import React, { useState } from 'react'
import Transaction from './Transaction'
import './index.css'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useEffect } from 'react';

function Home({ loggedIn, username }) {
  const [transactions, setTransactions] = useState([])

  const fetchTransactions = async () => {
    if (loggedIn && username) {
      try {
        const response = await fetch(`http://localhost:5000/transactions/${username}`, {
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
  }

  useEffect(() => {
    fetchTransactions();
  }, [loggedIn, username]);

  const handleLogout = () => {
    sessionStorage.removeItem('loggedIn');
    sessionStorage.removeItem('username');
    window.location.href = '/login';
  }

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
                <a className="nav-link" aria-current="page" href="/add-transactions">Add Transactions</a>
              </li>
              {/* <li className="nav-item">
                                <a className="nav-link" href="#">Link</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link disabled" aria-disabled="true">Disabled</a>
                            </li> */}
            </ul>
            <button id="logout-button" className="btn btn-primary ms-auto" onClick={handleLogout}>Log Out</button>
          </div>
        </div>
      </nav>
      <ul className="recent-transactions list-group">
        {transactions.map((transaction) => (<Transaction key={transaction._id} transaction={transaction} />))}
      </ul>
    </div>
  )
}

export default Home