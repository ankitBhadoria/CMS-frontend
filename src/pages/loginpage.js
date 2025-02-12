

import { Link, useNavigate } from "react-router-dom"
import { useContext, useEffect } from "react"
import AuthContext from "../context/AuthContext"
import './login.css'



export default function LoginPage() {
    const { user, loginUser } = useContext(AuthContext)
    const navigate = useNavigate();

    useEffect(() => {

        if (user) {
            navigate("/unauth");
            return;
        }

    }, []);

    return (
        <div className="login-page">
            <div className="login-card">
                <h2>Login</h2>
                <form onSubmit={loginUser}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input type="text" id="username" name="username" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" required />
                    </div>
                    <button type="submit" className="submit-button">
                        Login
                    </button>
                </form>
                <div className="links">
                    <Link to="/" className="guest-link">
                        Continue as guest
                    </Link>
                    <Link to="/register" className="register-link">
                        Don't have an account?
                    </Link>
                </div>
            </div>
        </div>
    )
}

