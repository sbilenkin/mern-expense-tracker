import { useState } from 'react';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.css';

function Transaction({ transaction, onEdit, onDelete, isAdmin }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editData, setEditData] = useState({
    description: transaction.description,
    amount: transaction.amount,
    type: transaction.type,
    date: transaction.date.split('T')[0],
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return localDate.toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      date: transaction.date.split('T')[0]
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (onEdit) {
      await onEdit(transaction._id, editData);
    }
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDelete = async () => {
    setIsDeleting(true);
  };

  const handleConfirmDelete = async () => {
    if (onDelete) {
      await onDelete(transaction._id);
    }
    setIsDeleting(false);
  };

  const handleCancelDelete = () => {
    setIsDeleting(false);
  };

  if (isEditing) {
    return (
      <li className="transaction-item list-group-item">
        <form className="edit-form" onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label>Description:</label>
              <input
                type="text"
                value={editData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="form-control"
                required
              />
            </div>
            <div className="form-group">
              <label>Amount:</label>
              <input
                type="number"
                step="0.01"
                value={editData.amount}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
                className="form-control"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Type:</label>
              <select
                value={editData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="form-control"
                required
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                value={editData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="form-control"
                required
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-sm">Save</button>
            <button type="button" onClick={handleCancel} className="btn btn-secondary btn-sm">Cancel</button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="transaction-item list-group-item">
      <div className="transaction-header">
        <span className={`transaction-amount ${transaction.type === 'income' ? 'income' : 'expense'}`}>
          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
        </span>
        <div className="transaction-date-container">
          <span className="transaction-date">{formatDate(transaction.date)}</span>
          <small className="transaction-created text-muted">
            Created: {formatDateTime(transaction.createdAt)}
          </small>
          {isAdmin && (
            <small className="transaction-username">Created by: {transaction.username}</small>
          )}
        </div>
      </div>
      <div className="transaction-footer">
        <div className="transaction-description">{transaction.description}</div>
        <div className="transaction-icons">
          <i className="fas fa-pencil-alt edit-icon" onClick={handleEdit}></i>
          <i className="fas fa-trash delete-icon" onClick={handleDelete}></i>
        </div>
      </div>
      {isDeleting && (
        <div className="delete-confirmation">
          <p>Are you sure you want to delete this transaction?</p>
          <button className="btn btn-danger btn-sm" onClick={handleConfirmDelete}>
            Delete
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleCancelDelete}>
            Cancel
          </button>
        </div>
      )}
    </li>
  );
}

export default Transaction