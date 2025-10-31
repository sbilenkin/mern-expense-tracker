import { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function AddTransactions() {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { authFetch, logout, userInfo, fetchUserInfo, isLoggedIn } = useAuth();

  useEffect(() => {
    // Only fetch user info if logged in
    if (isLoggedIn) {
      fetchUserInfo();
    }
  }, [isLoggedIn]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const description = formData.get('description');
    const amount = parseFloat(formData.get('amount'));
    const type = formData.get('type');
    const date = formData.get('date') || new Date().toISOString().split('T')[0];
    try {
      const response = await authFetch('http://localhost:5000/transactions', {
        method: 'POST',
        body: JSON.stringify({ description, amount, date, type }),
      });
      if (!response) {
        return;
      }
      const data = await response.json();
      if (response.ok) {
        setMessage('Transaction added successfully!');
        event.target.reset();
        // Only fetch user info if still logged in
        if (isLoggedIn) {
          fetchUserInfo();
        }
        setTimeout(() => {
          if (isLoggedIn) { // Check again before navigating
            navigate('/');
          }
        }, 1500);
      } else {
        if (data.limitReached) {
          setMessage('Transaction limit reached! Upgrade to Pro for unlimited transactions.');
        } else {
          setMessage(data.detail || 'Failed to add transaction');
        }
      }
    } catch (error) {
      setMessage('Error adding transaction: ' + error.message);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Check if user is logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="AddTransactions">
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">Expense Tracker</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/statistics">Statistics</Link>
              </li>
            </ul>
            <button id="logout-button" className="btn btn-primary ms-auto" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </div>
      </nav>
      
      <div className="form-container">
        <h2 className="form-welcome">Add a transaction</h2>
        
        {/* Only show limit warning if user is logged in and userInfo exists */}
        {isLoggedIn && userInfo && !userInfo.isPro && !userInfo.admin && (
          <div className="limit-warning">
            <p>
              <strong>Transactions remaining:</strong> {userInfo.remainingTransactions}/10
              {userInfo.remainingTransactions <= 3 && (
                <span className="text-danger"> - Upgrade to Pro for unlimited transactions!</span>
              )}
            </p>
          </div>
        )}
        
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

export default AddTransactions;