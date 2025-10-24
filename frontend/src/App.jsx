import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext.jsx';
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import AddTransactions from './AddTransactions';
import ManageUsers from './ManageUsers';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/add-transactions" element={<AddTransactions />} />
          <Route path="/user-management" element={<ManageUsers />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
