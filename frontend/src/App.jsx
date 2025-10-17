import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './Home'
import Login from './Login'
import Signup from './Signup'
import AddTransactions from './AddTransactions'
import './index.css'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  const [loggedIn, setLoggedIn] = useState(sessionStorage.getItem('loggedIn') === 'true')
  const [username, setUsername] = useState(sessionStorage.getItem('username') || '')
  const [isAdmin, setIsAdmin] = useState(sessionStorage.getItem('isAdmin') === 'true')

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={loggedIn ? <Home loggedIn={loggedIn} username={username} isAdmin={isAdmin} /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login onLogin={() => {
          setLoggedIn(true);
          setUsername(sessionStorage.getItem('username') || '');
          setIsAdmin(sessionStorage.getItem('isAdmin') === 'true');
        }} />} />
        <Route path="/signup" element={<Signup onLogin={() => {
          setLoggedIn(true);
          setUsername(sessionStorage.getItem('username') || '');
        }} />} />
        <Route path="/add-transactions" element={loggedIn ? <AddTransactions /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
