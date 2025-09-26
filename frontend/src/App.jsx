import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './Home'
import Login from './Login'
import './index.css'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  const [loggedIn, setLoggedIn] = useState(sessionStorage.getItem('loggedIn') === 'true')
  const [username, setUsername] = useState(sessionStorage.getItem('username') || '')

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={loggedIn ? <Home loggedIn={loggedIn} username={username} /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login onLogin={() => {
          setLoggedIn(true);
          setUsername(sessionStorage.getItem('username') || '');
        }} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
