import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.css';

function ManageUsers() {
  const { user, authFetch, logout, isLoggedIn, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await authFetch('http://localhost:5000/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      fetchUsers();
    }
  }, [isLoggedIn, isAdmin]);

  const handleLogout = () => {
    logout();
  };

  const handleDeleteUser = (userId) => {
    setDeletingUserId(userId);
  };

  const handleConfirmDelete = async (userId) => {
    try {
      const response = await authFetch(`http://localhost:5000/users/${userId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        setDeletingUserId(null);
      } else {
        console.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleCancelDelete = () => {
    setDeletingUserId(null);
  };

  const handleUpgradeUser = async (userId) => {
    try {
      const response = await authFetch(`http://localhost:5000/users/${userId}/upgrade`, {
        method: 'PUT',
      });

      if (response.ok) {
        const data = await response.json();

        // Update the user in local state
        setUsers(prev => prev.map(u =>
          u._id === userId
            ? { ...u, isPro: true }
            : u
        ));

        console.log("User upgraded to Pro successfully");
      } else {
        const errorData = await response.json();
        console.error("Failed to upgrade user:", errorData.detail);
      }
    } catch (error) {
      console.error("Error upgrading user:", error);
    }
  };

  const handleDowngradeUser = async (userId) => {
    try {
      const response = await authFetch(`http://localhost:5000/users/${userId}/downgrade`, {
        method: 'PUT',
      });

      if (response.ok) {
        const data = await response.json();

        // Update the user in local state
        setUsers(prev => prev.map(u =>
          u._id === userId
            ? { ...u, isPro: false }
            : u
        ));

        console.log("User downgraded from Pro successfully");
      } else {
        const errorData = await response.json();
        console.error("Failed to downgrade user:", errorData.detail);
      }
    } catch (error) {
      console.error("Error downgrading user:", error);
    }
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <div className="ManageUsers">
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Expense Tracker</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="/">Home</a>
              </li>
              {isAdmin && (
                <li>
                  <a className="nav-link active" aria-current="page" href="#">Manage Users</a>
                </li>
              )}
              <li className="nav-item">
                <a className="nav-link btn btn-primary add-transactions" aria-current="page" href="/add-transactions">Add Transactions</a>
              </li>
            </ul>
            <button id="logout-button" className="btn btn-primary ms-auto" onClick={handleLogout}>Log Out</button>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <h2>User Management</h2>
        <ul className="user-cards list-group">
          {users.map((userItem) => (
            <li key={userItem._id} className="list-group-item">
              <div className="user-info">
                <div className="user-details">
                  <strong>{userItem.username}</strong>
                  <span className={`badge ${userItem.admin ? 'bg-success' : 'bg-secondary'} ms-2`}>
                    {userItem.admin ? 'Admin' : 'User'}
                  </span>
                  {userItem.isPro && (
                    <span className="badge bg-warning ms-1">Pro</span>
                  )}
                  <small className="text-muted ms-2">
                    Transactions: {userItem.transactionCount}
                  </small>
                </div>
                <div className="user-actions">
                  {!userItem.isPro && !userItem.admin && (
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleUpgradeUser(userItem._id)}
                    >
                      Upgrade to Pro
                    </button>
                  )}
                  {userItem.isPro && !userItem.admin && (
                    <button
                      className="btn btn-sm btn-secondary me-2"
                      onClick={() => handleDowngradeUser(userItem._id)}
                    >
                      Remove Pro
                    </button>
                  )}
                  <i className="fas fa-trash delete-icon" onClick={() => handleDeleteUser(userItem._id)}></i>
                </div>
              </div>

              {deletingUserId === userItem._id && (
                <div className="delete-confirmation mt-2">
                  <p>Are you sure you want to delete user "{userItem.username}"?</p>
                  <button
                    className="btn btn-danger btn-sm me-2"
                    onClick={() => handleConfirmDelete(userItem._id)}
                  >
                    Delete
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleCancelDelete}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ManageUsers