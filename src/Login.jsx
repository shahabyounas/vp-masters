import { Link } from 'react-router-dom';
import './Auth.css';

function Login() {
  return (
    <div className="auth-container">
      <h2 className="auth-title">Login</h2>
      <form className="auth-form">
        <input type="email" placeholder="Email" className="auth-input" required />
        <input type="password" placeholder="Password" className="auth-input" required />
        <button type="submit" className="auth-btn">Login</button>
      </form>
      <div className="auth-footer">
        <Link to="/register" className="auth-link-btn">Registration</Link>
      </div>
    </div>
  );
}

export default Login; 