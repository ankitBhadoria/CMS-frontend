import { useContext } from "react";
import SAdminDashboard from './sadmindaskboard';
import AdminDashboard from './admindashboard';
import UserDashboard from './practiceuserdashboard';
import AuthContext from "../context/AuthContext";



export default function Dashboard() {
    const { user } = useContext(AuthContext);

    return (<>
        {user.role === "superadmin" && <SAdminDashboard />}
        {user.role === "admin" && <AdminDashboard />}
        {user.role !== "superadmin" && user.role !== "admin" && <UserDashboard />}
    </>)
}

