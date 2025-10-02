import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';

function Signup({ onLogin }) {
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');
    const response = await fetch('http://localhost:5000/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (response.ok) {
      toast.success('Sign up successful! Logging you in...');
      sessionStorage.setItem('loggedIn', 'true');
      sessionStorage.setItem('username', data.user.username);
      if (onLogin) {
        onLogin();
      }
      setTimeout(() => {
        navigate('/'); // Redirect to home page
      }, 1500);
    } else {
      toast.error(data.detail || 'Sign up failed');
    }
  };

  return (
    <div className="SignUp Login">
      <h2 className="signup-welcome login-welcome">Welcome to Expense Tracker!</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div>
          <input type="text" name="username" placeholder="Username" required />
        </div>
        <div>
          <input type="password" name="password" placeholder="Password" required />
        </div>
        <div>
          <button className="btn btn-primary" type="submit">Sign Up</button>
        </div>
      </form>
      <ToastContainer />
    </div>
  )
}

export default Signup