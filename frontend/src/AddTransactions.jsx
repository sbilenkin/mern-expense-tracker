import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function AddTransactions() {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { authFetch, logout } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = sessionStorage.getItem('username');
    const description = formData.get('description');
    const amount = parseFloat(formData.get('amount'));
    const type = formData.get('type');
    const date = formData.get('date') || new Date().toISOString().split('T')[0];
    // Trying to figure out why date is not being sent correctly
    console.log({ username, description, amount, date, type });
    try {
      const response = await authFetch('http://localhost:5000/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, description, amount, date, type }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Transaction added successfully!');
        event.target.reset();
        navigate('/');
      } else {
        setMessage(data.detail || 'Failed to add transaction');
      }
    } catch (error) {
      setMessage('Error adding transaction: ' + error.message);
    }
  };

  const handleLogout = () => {
    logout();
  }

  return (
    <div className="AddTransactions">
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Expense Tracker</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link" aria-current="page" href="/">Home</a>
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
      <div className="form-container">
        <h2 className="form-welcome">Add a transaction</h2>
        <form className="transaction-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              className="form-control"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select id="type" name="type" className="form-control" required>
              <option value="">Select type</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              className="form-control"
              defaultValue={new Date().toISOString().split('T')[0]}
            />
          </div>
          <button type="submit" className="btn btn-primary">Add Transaction</button>
        </form>

        {message && <div className="form-message">{message}</div>}
      </div>
    </div>
  );
}

export default AddTransactions