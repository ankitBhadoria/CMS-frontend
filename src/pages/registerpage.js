
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import "./register.css";

export default function RegisterPage() {
    const { user } = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    // const [role, setRole] = useState("practiceuser");
    const [practiceId, setPracticeId] = useState("");
    const [practices, setPractices] = useState([]);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {

        if (user) {
            navigate("/unauth");
            return;
        }

        const fetchPractices = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/Practice/");
                setPractices(response.data);
            } catch (error) {
                console.error("Error fetching practices:", error);
            }
        };
        fetchPractices();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://127.0.0.1:8000/UserProfile/", {
                username,
                email,
                password,
                role: 'practiceuser',
                practice_id: practiceId || null, // Send practice_id only if selected
            });
            navigate("/login");
        } catch (error) {
            console.log(error);
            setMessage(error.response?.data?.message || "An error occurred");
        }
    };

    return (
        <div className="register-page">
            <div className="register-card">
                <h2>Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {/* <div className="form-group">
                        <label htmlFor="role">You are a:</label>
                        <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="practiceuser">Practice User</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Super Admin</option>
                        </select>
                    </div> */}
                    <div className="form-group">
                        <label htmlFor="practice">Select Practice</label>
                        <select id="practice" value={practiceId} onChange={(e) => setPracticeId(e.target.value)} required>
                            <option value="">-- Select a Practice --</option>
                            {practices.map((practice) => (
                                <option key={practice.id} value={practice.id}>
                                    {practice.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="submit-button">
                        Register
                    </button>
                </form>
                {message && <p className="error-message">{message}</p>}
                <div className="links">
                    <Link to="/" className="guest-link">
                        Continue as guest
                    </Link>
                    <Link to="/login" className="login-link">
                        Already have an account?
                    </Link>
                </div>
            </div>
        </div>
    );
}


