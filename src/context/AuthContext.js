import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from "react-router-dom"

const AuthContext = createContext()

export default AuthContext;

export const AuthProvider = ({ children }) => {

    let [authTokens, setAuthTokens] = useState(() => localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null)
    let [user, setUser] = useState(() => localStorage.getItem('authTokens') ? jwtDecode(JSON.parse(localStorage.getItem('authTokens')).access) : null)
    // let [loading, setLoading] = useState(true)

    let navigate = useNavigate()

    // let loginUser = async (e) => {
    //     e.preventDefault();
    //     let response = await axios.post("http://127.0.0.1:8000/api/token/", {
    //         username: e.target.username.value,
    //         password: e.target.password.value,
    //     });

    //     if (response.status === 200) {
    //         let data = response.data;
    //         setAuthTokens(data)
    //         setUser(jwtDecode(data.access))
    //         localStorage.setItem('authTokens', JSON.stringify(data))
    //         navigate('/')
    //     }
    //     else {
    //         alert('something went wrong')
    //     }
    // }

    const loginUser = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/token/", {
                username: e.target.username.value,
                password: e.target.password.value,
            });

            if (response.status === 200) {
                const data = response.data;

                // Save tokens and decode user info
                const decodedUser = jwtDecode(data.access);
                const userId = decodedUser.user_id;

                // Fetch user role from the backend
                const roleResponse = await axios.get(`http://127.0.0.1:8000/UserProfile/${userId}/`, {
                    headers: {
                        Authorization: `Bearer ${data.access}`,
                    },
                });

                if (roleResponse.status === 200) {
                    const userRole = roleResponse.data.role;

                    // Set tokens, user, and role in context
                    setAuthTokens(data);
                    setUser({ ...decodedUser, role: userRole });
                    localStorage.setItem('authTokens', JSON.stringify(data));

                    // Navigate based on user role
                    if (userRole === 'superadmin') {
                        navigate('/dashboard-sa');
                    } else if (userRole === 'admin') {
                        navigate('/dashboard-a');
                    } else if (userRole === 'practiceuser') {
                        navigate('/dashboard-pu');
                    } else {
                        alert('Unknown user role.');
                    }
                }
            } else {
                alert('Login failed.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Something went wrong. Please try again.');
        }
    };

    let logoutUser = () => {
        setAuthTokens(null)
        setUser(null)
        localStorage.removeItem('authTokens')
        navigate('/')
    }

    // let updateToken = async () => {
    //     // console.log('update token called')
    //     let response = await axios.post("http://127.0.0.1:8000/api/token/refresh/",
    //         { refresh: authTokens?.refresh },
    //         {
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //         }
    //     );
    //     if (response.status === 200) {
    //         let data = response.data;
    //         setAuthTokens(data)
    //         setUser(jwtDecode(data.access))
    //         localStorage.setItem('authTokens', JSON.stringify(data))
    //     }
    //     else {
    //         logoutUser()
    //     }

    //     if (loading) {
    //         setLoading(false)
    //     }
    // }

    let updateToken = async () => {
        try {
            // Check if refresh token exists before making the request
            if (!authTokens?.refresh) {
                logoutUser();
                return;
            }

            let response = await axios.post("http://127.0.0.1:8000/api/token/refresh/",
                { refresh: authTokens.refresh },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                setAuthTokens(response.data);
                setUser(jwtDecode(response.data.access));
                localStorage.setItem('authTokens', JSON.stringify(response.data));
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            logoutUser();
        }
        //  finally {
        //     if (loading) {
        //         setLoading(false);
        //     }
        // }
    }


    let contextData = {
        user: user,
        authTokens: authTokens,
        loginUser: loginUser,
        logoutUser: logoutUser,
    }

    // useEffect(() => {

    //     if (loading) {
    //         updateToken()
    //     }

    //     let interval = setInterval(() => {
    //         if (authTokens) {
    //             updateToken()
    //         }
    //     }, 1000 * 60 * 18)
    //     return () => clearInterval(interval)

    // }, [authTokens, loading])

    // return (
    //     <AuthContext.Provider value={contextData}>
    //         {loading ? null : children}
    //     </AuthContext.Provider>
    // )
    useEffect(() => {

        let interval = setInterval(() => {
            if (authTokens) {
                updateToken()
            }
        }, 1000 * 60 * 18)
        return () => clearInterval(interval)

    }, [authTokens])

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    )
}


