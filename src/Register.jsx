import { Link } from 'react-router-dom';
import './Auth.css';

function Register() {
  return (
    <div className="auth-container">
      <h2 className="auth-title">Register</h2>
      <form className="auth-form">
        <input type="text" placeholder="Name" className="auth-input" required />
        <input type="email" placeholder="Email" className="auth-input" required />
        <input type="password" placeholder="Password" className="auth-input" required />
        <button type="submit" className="auth-btn">Register</button>
      </form>
      <div className="auth-footer">
        <Link to="/" className="auth-link-btn">Back to Login</Link>
      </div>
    </div>
  );
}

export default Register; 