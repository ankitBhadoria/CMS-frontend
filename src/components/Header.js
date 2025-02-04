// import { Link } from "react-router-dom";
// import { useContext } from "react";
// import AuthContext from "../context/AuthContext";

// export default function Header() {
//     let { user, logoutUser } = useContext(AuthContext)
//     return (
//         <header>
//             <nav>
//                 <span><Link to='/'>PBN Management</Link></span>
//                 <span className="auth">
//                     {user ? (
//                         // <Link to="/">logout</Link>
//                         <p onClick={logoutUser}>Logout</p>
//                     ) : (
//                         <>
//                             <Link to="/login">login</Link>
//                             <Link to="/register">register</Link>
//                         </>
//                     )}

//                 </span>

//                 {user && <p>hello, {user.username}</p>}
//             </nav>
//         </header>
//     );
// }

import { Link } from "react-router-dom"
import { useContext } from "react"
import AuthContext from "../context/AuthContext"
import './header.css'

export default function Header() {
    const { user, logoutUser } = useContext(AuthContext)

    return (
        <header className="main-header">
            <nav className="navbar">
                <div className="navbar-brand">
                    <Link to="/">PBN Management</Link>
                </div>
                <div className="navbar-menu">
                    {user ? (
                        <>
                            <span className="user-greeting">Hello, {user.username}</span>
                            <button className="logout-button" onClick={logoutUser}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="login-button">
                                Login
                            </Link>
                            <Link to="/register" className="register-button">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    )
}

