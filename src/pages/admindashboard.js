import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import "./admindashboard.css";

export default function AdminDashboard() {
    const { authTokens, user } = useContext(AuthContext);
    const [adminCampaigns, setAdminCampaigns] = useState([]);
    const [superAdminCampaigns, setSuperAdminCampaigns] = useState([]);
    const [practice, setPractice] = useState(null);
    const [selectedPracticeUsers, setSelectedPracticeUsers] = useState([]);
    const [newCampaign, setNewCampaign] = useState({ name: "", description: "", type: "", status: "" });
    const [editingCampaign, setEditingCampaign] = useState(null);

    useEffect(() => {
        fetchUserProfile();
        // fetchCampaigns();
    }, []);

    useEffect(() => {
        if (practice?.id) {
            fetchCampaigns();  // Fetch campaigns after practice is set
        }
    }, [practice]);  // This will trigger when the practice changes


    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/UserProfile/${user.user_id}/`);
            const userProfile = response.data;
            if (userProfile.practice_id) {
                fetchPracticeDetails(userProfile.practice_id);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const fetchPracticeDetails = async (practiceId) => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/Practice/${practiceId}/`);
            setPractice(response.data);
        } catch (error) {
            console.error("Error fetching practice details:", error);
        }
    };

    const fetchCampaigns = async () => {
        try {
            if (!practice) return;
            const adminResponse = await axios.get("http://127.0.0.1:8000/AdminCampaign/", {
                headers: { Authorization: `Bearer ${authTokens.access}` },
                params: { practice_id: practice.id }
            });
            setAdminCampaigns(adminResponse.data);
            // console.log(adminResponse.data)

            const superAdminResponse = await axios.get("http://127.0.0.1:8000/Campaign/", { headers: { Authorization: `Bearer ${authTokens.access}` } });
            setSuperAdminCampaigns(superAdminResponse.data);
            // console.log(superAdminResponse.data)
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        }
    };

    const handleCreateCampaign = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                "http://127.0.0.1:8000/AdminCampaign/",
                { ...newCampaign, belongto: practice.id },
                { headers: { Authorization: `Bearer ${authTokens.access}` } }
            );
            setNewCampaign({ name: "", description: "", type: "", status: "" });
            fetchCampaigns();
        } catch (error) {
            console.error("Error creating admin campaign:", error);
        }
    };

    const handleUpdateCampaign = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `http://127.0.0.1:8000/AdminCampaign/${editingCampaign.id}/`,
                editingCampaign,
                { headers: { Authorization: `Bearer ${authTokens.access}` } }
            );
            setEditingCampaign(null);
            fetchCampaigns();
        } catch (error) {
            console.error("Error updating admin campaign:", error);
        }
    };

    const handleDeleteCampaign = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/AdminCampaign/${id}/`, {
                headers: { Authorization: `Bearer ${authTokens.access}` },
            });
            fetchCampaigns();
        } catch (error) {
            console.error("Error deleting admin campaign:", error);
        }
    };

    const sendMessageToUsers = async (campaign) => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/UserProfile/", {
                params: {
                    role: "practiceuser",
                    practice_id: practice.id
                }
            });

            const practiceUsers = response.data;
            setSelectedPracticeUsers(practiceUsers);

            for (const userProfile of practiceUsers) {
                try {
                    await axios.post(
                        "http://127.0.0.1:8000/Message/",
                        {
                            userprofile_id: userProfile.id,
                            name: campaign.name,
                            type: campaign.type,
                            description: campaign.description,
                            status: campaign.status,
                        },
                        {
                            headers: { Authorization: `Bearer ${authTokens.access}` },
                        }
                    );
                    console.log(`Message sent to userProfile ${userProfile.id}`);
                } catch (error) {
                    console.error(`Error sending message to userProfile ${userProfile.id}:`, error);
                }
            }
        } catch (error) {
            console.error("Error fetching user profiles:", error);
        }
    };

    return (
        <div className="admin-dashboard">
            {practice && <h1 className="practice-info">{practice.name}</h1>}
            <h2>Admin Dashboard</h2>

            {/* Create New Campaign */}
            <section className="create-campaign">
                <h2>Create New Campaign</h2>
                <form onSubmit={handleCreateCampaign}>
                    <input type="text" placeholder="Campaign Name" value={newCampaign.name} onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })} required />
                    <textarea placeholder="Campaign Description" value={newCampaign.description} onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })} required />
                    <input type="text" placeholder="Campaign Type" value={newCampaign.type} onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value })} required />
                    <select value={newCampaign.status} onChange={(e) => setNewCampaign({ ...newCampaign, status: e.target.value })} required>
                        <option value="">Select Campaign Status</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="running">Running</option>
                        {/* <option value="expired">Expired</option> */}
                    </select>
                    <button type="submit">Create Campaign</button>
                </form>
            </section>

            {/* Admin Campaigns */}
            <div className="campaigns-section">
                <h2>Practice-Specific Campaigns</h2>
                {adminCampaigns.map((campaign) => (
                    <li key={campaign.id} className="campaign-card">
                        {editingCampaign?.id === campaign.id ? (
                            // Inline Edit Form
                            <form onSubmit={handleUpdateCampaign}>
                                <input
                                    type="text"
                                    value={editingCampaign.name}
                                    onChange={(e) => setEditingCampaign({ ...editingCampaign, name: e.target.value })}
                                    required
                                />
                                <textarea
                                    value={editingCampaign.description}
                                    onChange={(e) => setEditingCampaign({ ...editingCampaign, description: e.target.value })}
                                    required
                                />
                                <div className="campaign-details">
                                    <p>
                                        <strong>Type:</strong>
                                        <input
                                            type="text"
                                            value={editingCampaign.type}
                                            onChange={(e) => setEditingCampaign({ ...editingCampaign, type: e.target.value })}
                                            required
                                        />
                                    </p>
                                    <p>
                                        <strong>Status:</strong>
                                        <select
                                            value={editingCampaign.status}
                                            onChange={(e) => setEditingCampaign({ ...editingCampaign, status: e.target.value })}
                                            required
                                        >
                                            <option value="upcoming">Upcoming</option>
                                            <option value="running">Running</option>
                                            {/* <option value="expired">Expired</option> */}
                                        </select>
                                    </p>
                                </div>
                                <button type="submit">Save</button>
                                <button type="button" onClick={() => setEditingCampaign(null)}>Cancel</button>
                            </form>
                        ) : (
                            // Display Campaign Details
                            <>
                                <h3>{campaign.name}</h3>
                                <p className="campaign-description">{campaign.description}</p>
                                <div className="campaign-details">
                                    <p><strong>Type:</strong> {campaign.type}</p>
                                    <p><strong>Status:</strong> {campaign.status}</p>
                                </div>
                                <button onClick={() => setEditingCampaign(campaign)}>Edit</button>
                                <button className="btn-dlt" onClick={() => handleDeleteCampaign(campaign.id)}>Delete</button>
                                <button onClick={() => sendMessageToUsers(campaign)}>Send</button>
                            </>
                        )}
                    </li>
                ))}
            </div>


            {/* Super Admin Campaigns */}
            <div className="campaigns-section">
                <h2>Super Admin Campaigns</h2>
                {superAdminCampaigns.map((campaign) => (
                    <li key={campaign.id} className="campaign-card">
                        <h3>{campaign.name}</h3>
                        <p className="campaign-description">{campaign.description}</p>
                        <div className="campaign-details">
                            <p>
                                <strong>Type:</strong> {campaign.type}
                            </p>
                            <p>
                                <strong>Status:</strong> {campaign.status}
                            </p>
                        </div>
                        <button onClick={() => sendMessageToUsers(campaign)}>Send</button>
                    </li>
                ))}
            </div>
        </div>
    );
}


// import { useState, useEffect, useContext } from "react";
// import axios from "axios";
// import AuthContext from "../context/AuthContext";
// import "./admindashboard.css";

// export default function AdminDashboard() {
//     const { authTokens, user } = useContext(AuthContext);
//     const [adminCampaigns, setAdminCampaigns] = useState([]);
//     const [superAdminCampaigns, setSuperAdminCampaigns] = useState([]);
//     const [practice, setPractice] = useState(null);
//     const [selectedPracticeUsers, setSelectedPracticeUsers] = useState([]);
//     const [newCampaign, setNewCampaign] = useState({ name: "", description: "", type: "", status: "" });
//     const [editingCampaign, setEditingCampaign] = useState(null);

//     useEffect(() => {
//         fetchUserProfile();
//         fetchCampaigns();
//     }, []);

//     const fetchUserProfile = async () => {
//         try {
//             const response = await axios.get(`http://127.0.0.1:8000/UserProfile/${user.user_id}/`);
//             const userProfile = response.data;
//             if (userProfile.practice_id) {
//                 fetchPracticeDetails(userProfile.practice_id);
//             }
//         } catch (error) {
//             console.error("Error fetching user profile:", error);
//         }
//     };

//     const fetchPracticeDetails = async (practiceId) => {
//         try {
//             const response = await axios.get(`http://127.0.0.1:8000/Practice/${practiceId}/`);
//             setPractice(response.data);
//         } catch (error) {
//             console.error("Error fetching practice details:", error);
//         }
//     };

//     const fetchCampaigns = async () => {
//         try {
//             const adminResponse = await axios.get("http://127.0.0.1:8000/AdminCampaign/", {
//                 headers: { Authorization: `Bearer ${authTokens.access}` },
//             });
//             setAdminCampaigns(adminResponse.data);

//             const superAdminResponse = await axios.get("http://127.0.0.1:8000/Campaign/");
//             setSuperAdminCampaigns(superAdminResponse.data);
//         } catch (error) {
//             console.error("Error fetching campaigns:", error);
//         }
//     };

//     const handleCreateCampaign = async (e) => {
//         e.preventDefault();
//         try {
//             await axios.post(
//                 "http://127.0.0.1:8000/AdminCampaign/",
//                 { ...newCampaign, belongto: practice.id },
//                 { headers: { Authorization: `Bearer ${authTokens.access}` } }
//             );
//             setNewCampaign({ name: "", description: "", type: "", status: "" });
//             fetchCampaigns();
//         } catch (error) {
//             console.error("Error creating admin campaign:", error);
//         }
//     };

//     const handleUpdateCampaign = async (e) => {
//         e.preventDefault();
//         try {
//             await axios.put(
//                 `http://127.0.0.1:8000/AdminCampaign/${editingCampaign.id}/`,
//                 editingCampaign,
//                 { headers: { Authorization: `Bearer ${authTokens.access}` } }
//             );
//             setEditingCampaign(null);
//             fetchCampaigns();
//         } catch (error) {
//             console.error("Error updating admin campaign:", error);
//         }
//     };

//     const handleDeleteCampaign = async (id) => {
//         try {
//             await axios.delete(`http://127.0.0.1:8000/AdminCampaign/${id}/`, {
//                 headers: { Authorization: `Bearer ${authTokens.access}` },
//             });
//             fetchCampaigns();
//         } catch (error) {
//             console.error("Error deleting admin campaign:", error);
//         }
//     };

//     const sendMessageToUsers = async (campaign) => {
//         try {
//             const response = await axios.get("http://127.0.0.1:8000/UserProfile/", {
//                 params: {
//                     role: "practiceuser",
//                     practice_id: practice.id
//                 }
//             });

//             const practiceUsers = response.data;
//             setSelectedPracticeUsers(practiceUsers);

//             for (const userProfile of practiceUsers) {
//                 try {
//                     await axios.post(
//                         "http://127.0.0.1:8000/Message/",
//                         {
//                             userprofile_id: userProfile.id,
//                             name: campaign.name,
//                             type: campaign.type,
//                             description: campaign.description,
//                             status: campaign.status,
//                         },
//                         {
//                             headers: { Authorization: `Bearer ${authTokens.access}` },
//                         }
//                     );
//                     console.log(`Message sent to userProfile ${userProfile.id}`);
//                 } catch (error) {
//                     console.error(`Error sending message to userProfile ${userProfile.id}:`, error);
//                 }
//             }
//         } catch (error) {
//             console.error("Error fetching user profiles:", error);
//         }
//     };

//     return (
//         <div className="admin-dashboard">
//             {practice && <h1 className="practice-info">{practice.name}</h1>}
//             <h2>Admin Dashboard</h2>

//             {/* Create New Campaign */}
//             <section className="create-campaign">
//                 <h2>Create New Campaign</h2>
//                 <form onSubmit={handleCreateCampaign}>
//                     <input
//                         type="text"
//                         placeholder="Campaign Name"
//                         value={newCampaign.name}
//                         onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
//                         required
//                     />
//                     <textarea
//                         placeholder="Campaign Description"
//                         value={newCampaign.description}
//                         onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
//                         required
//                     />
//                     <input
//                         type="text"
//                         placeholder="Campaign Type"
//                         value={newCampaign.type}
//                         onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value })}
//                         required
//                     />
//                     <select
//                         value={newCampaign.status}
//                         onChange={(e) => setNewCampaign({ ...newCampaign, status: e.target.value })}
//                         required
//                     >
//                         <option value="">Select Campaign Status</option>
//                         <option value="upcoming">Upcoming</option>
//                         <option value="running">Running</option>
//                         <option value="expired">Expired</option>
//                     </select>
//                     <button type="submit">Create Campaign</button>
//                 </form>
//             </section>

//             {/* Admin Campaigns */}
//             <div className="campaigns-section">
//                 <h2>Practice-Specific Campaigns</h2>
//                 {adminCampaigns.length > 0 ? (
//                     <ul className="campaign-list">
//                         {adminCampaigns.map((campaign) => (
//                             <li key={campaign.id} className="campaign-card">
//                                 {editingCampaign?.id === campaign.id ? (
//                                     <form onSubmit={handleUpdateCampaign}>
//                                         <input
//                                             type="text"
//                                             value={editingCampaign.name}
//                                             onChange={(e) => setEditingCampaign({ ...editingCampaign, name: e.target.value })}
//                                             required
//                                         />
//                                         <textarea
//                                             value={editingCampaign.description}
//                                             onChange={(e) => setEditingCampaign({ ...editingCampaign, description: e.target.value })}
//                                             required
//                                         />
//                                         <input
//                                             type="text"
//                                             value={editingCampaign.type}
//                                             onChange={(e) => setEditingCampaign({ ...editingCampaign, type: e.target.value })}
//                                             required
//                                         />
//                                         <select
//                                             value={editingCampaign.status}
//                                             onChange={(e) => setEditingCampaign({ ...editingCampaign, status: e.target.value })}
//                                             required
//                                         >
//                                             <option value="upcoming">Upcoming</option>
//                                             <option value="running">Running</option>
//                                             <option value="expired">Expired</option>
//                                         </select>
//                                         <button type="submit">Save</button>
//                                         <button type="button" onClick={() => setEditingCampaign(null)}>Cancel</button>
//                                     </form>
//                                 ) : (
//                                     <>
//                                         <h3>{campaign.name}</h3>
//                                         <button onClick={() => setEditingCampaign(campaign)}>Edit</button>
//                                         <button onClick={() => handleDeleteCampaign(campaign.id)}>Delete</button>
//                                         <button onClick={() => sendMessageToUsers(campaign)}>Send</button>
//                                     </>
//                                 )}
//                             </li>
//                         ))}
//                     </ul>
//                 ) : (
//                     <p>No admin campaigns found.</p>
//                 )}
//             </div>
//         </div>
//     );
// }


// // import { useState, useEffect, useContext } from "react";
// // import axios from "axios";
// // import AuthContext from "../context/AuthContext";
// // import "./admindashboard.css";

// // export default function AdminDashboard() {
// //     const { authTokens, user } = useContext(AuthContext);
// //     const [adminCampaigns, setAdminCampaigns] = useState([]);
// //     const [superAdminCampaigns, setSuperAdminCampaigns] = useState([]);
// //     const [practice, setPractice] = useState(null);
// //     const [newCampaign, setNewCampaign] = useState({ name: "", description: "", type: "", status: "" });
// //     const [editingCampaignId, setEditingCampaignId] = useState(null);

// //     useEffect(() => {
// //         fetchUserProfile();
// //         fetchCampaigns();
// //     }, []);

// //     const fetchUserProfile = async () => {
// //         try {
// //             const response = await axios.get(`http://127.0.0.1:8000/UserProfile/${user.user_id}/`);
// //             const userProfile = response.data;
// //             if (userProfile.practice_id) {
// //                 fetchPracticeDetails(userProfile.practice_id);
// //             }
// //         } catch (error) {
// //             console.error("Error fetching user profile:", error);
// //         }
// //     };

// //     const fetchPracticeDetails = async (practiceId) => {
// //         try {
// //             const response = await axios.get(`http://127.0.0.1:8000/Practice/${practiceId}/`);
// //             setPractice(response.data);
// //         } catch (error) {
// //             console.error("Error fetching practice details:", error);
// //         }
// //     };

// //     const fetchCampaigns = async () => {
// //         try {
// //             // Fetch admin campaigns (created by this admin)
// //             const adminResponse = await axios.get("http://127.0.0.1:8000/AdminCampaign/", {
// //                 headers: { Authorization: `Bearer ${authTokens.access}` },
// //             });
// //             setAdminCampaigns(adminResponse.data);

// //             // Fetch super admin campaigns (normal campaigns)
// //             const superAdminResponse = await axios.get("http://127.0.0.1:8000/Campaign/");
// //             setSuperAdminCampaigns(superAdminResponse.data);
// //         } catch (error) {
// //             console.error("Error fetching campaigns:", error);
// //         }
// //     };

// //     const handleCreateCampaign = async (e) => {
// //         e.preventDefault();
// //         try {
// //             await axios.post(
// //                 "http://127.0.0.1:8000/AdminCampaign/",
// //                 { ...newCampaign, belongto: practice.id }, // Link campaign to admin's practice
// //                 { headers: { Authorization: `Bearer ${authTokens.access}` } }
// //             );
// //             setNewCampaign({ name: "", description: "", type: "", status: "" });
// //             fetchCampaigns();
// //         } catch (error) {
// //             console.error("Error creating admin campaign:", error);
// //         }
// //     };

// //     const handleUpdateCampaign = async (e, updatedCampaign) => {
// //         e.preventDefault();
// //         try {
// //             await axios.put(
// //                 `http://127.0.0.1:8000/AdminCampaign/${updatedCampaign.id}/`,
// //                 updatedCampaign,
// //                 { headers: { Authorization: `Bearer ${authTokens.access}` } }
// //             );
// //             setEditingCampaignId(null);
// //             fetchCampaigns();
// //         } catch (error) {
// //             console.error("Error updating admin campaign:", error);
// //         }
// //     };

// //     const handleDeleteCampaign = async (id) => {
// //         try {
// //             await axios.delete(`http://127.0.0.1:8000/AdminCampaign/${id}/`, {
// //                 headers: { Authorization: `Bearer ${authTokens.access}` },
// //             });
// //             fetchCampaigns();
// //         } catch (error) {
// //             console.error("Error deleting admin campaign:", error);
// //         }
// //     };

// //     return (
// //         <div className="admin-dashboard">
// //             {practice && <h1 className="practice-info">{practice.name}</h1>}
// //             <h2>Admin Dashboard</h2>

// //             {/* Create New Campaign */}
// //             <section className="create-campaign">
// //                 <h2>Create New Campaign</h2>
// //                 <form onSubmit={handleCreateCampaign}>
// //                     <input
// //                         type="text"
// //                         placeholder="Campaign Name"
// //                         value={newCampaign.name}
// //                         onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
// //                         required
// //                     />
// //                     <textarea
// //                         placeholder="Campaign Description"
// //                         value={newCampaign.description}
// //                         onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
// //                         required
// //                     />
// //                     <input
// //                         type="text"
// //                         placeholder="Campaign Type"
// //                         value={newCampaign.type}
// //                         onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value })}
// //                         required
// //                     />
// //                     <select
// //                         value={newCampaign.status}
// //                         onChange={(e) => setNewCampaign({ ...newCampaign, status: e.target.value })}
// //                         required
// //                     >
// //                         <option value="">Select Campaign Status</option>
// //                         <option value="upcoming">Upcoming</option>
// //                         <option value="running">Running</option>
// //                     </select>
// //                     <button type="submit">Create Campaign</button>
// //                 </form>
// //             </section>

// //             {/* Admin Campaigns */}
// //             <div className="campaigns-section">
// //                 <h2>Practice specific Campaigns</h2>
// //                 {adminCampaigns.length > 0 ? (
// //                     <ul className="campaign-list">
// //                         {adminCampaigns.map((campaign) => (
// //                             <li key={campaign.id} className="campaign-card">
// //                                 {editingCampaignId === campaign.id ? (
// //                                     // Inline Edit Form
// //                                     <form onSubmit={(e) => handleUpdateCampaign(e, campaign)}>
// //                                         <input
// //                                             type="text"
// //                                             value={campaign.name}
// //                                             onChange={(e) => setAdminCampaigns(adminCampaigns.map(c => c.id === campaign.id ? { ...c, name: e.target.value } : c))}
// //                                             required
// //                                         />
// //                                         <textarea
// //                                             value={campaign.description}
// //                                             onChange={(e) => setAdminCampaigns(adminCampaigns.map(c => c.id === campaign.id ? { ...c, description: e.target.value } : c))}
// //                                             required
// //                                         />
// //                                         <button type="submit">Save</button>
// //                                         <button type="button" onClick={() => setEditingCampaignId(null)}>Cancel</button>
// //                                     </form>
// //                                 ) : (
// //                                     <>
// //                                         <h3>{campaign.name}</h3>
// //                                         <p>{campaign.description}</p>
// //                                         <p>Type: {campaign.type}</p>
// //                                         <p>Status: {campaign.status}</p>
// //                                         <button onClick={() => setEditingCampaignId(campaign.id)}>Edit</button>
// //                                         <button onClick={() => handleDeleteCampaign(campaign.id)}>Delete</button>
// //                                     </>
// //                                 )}
// //                             </li>
// //                         ))}
// //                     </ul>
// //                 ) : (
// //                     <p>No admin campaigns found.</p>
// //                 )}
// //             </div>

// //             {/* Super Admin Campaigns */}
// //             <div className="campaigns-section">
// //                 <h2>Super Admin Campaigns</h2>
// //                 <ul className="campaign-list">
// //                     {superAdminCampaigns.map((campaign) => (
// //                         <li key={campaign.id} className="campaign-card">
// //                             <h3>{campaign.name}</h3>
// //                             <p>{campaign.description}</p>
// //                             <p>Type: {campaign.type}</p>
// //                             <p>Status: {campaign.status}</p>
// //                         </li>
// //                     ))}
// //                 </ul>
// //             </div>
// //         </div>
// //     );
// // }


// // // import { useState, useEffect, useContext } from "react"
// // // import axios from "axios"
// // // import AuthContext from "../context/AuthContext"
// // // import './admindashboard.css'

// // // export default function AdminDashboard() {
// // //     const [campaigns, setCampaigns] = useState([])
// // //     const [practice, setPractice] = useState(null);
// // //     const { authTokens, user } = useContext(AuthContext)

// // //     useEffect(() => {
// // //         fetchUserProfile()
// // //         fetchCampaigns()
// // //     }, [])

// // //     const fetchUserProfile = async () => {
// // //         try {
// // //             const response = await axios.get(`http://127.0.0.1:8000/UserProfile/${user.user_id}/`);

// // //             const userProfile = response.data;
// // //             if (userProfile.practice_id) {
// // //                 fetchPracticeDetails(userProfile.practice_id);
// // //             }
// // //         } catch (error) {
// // //             console.error("Error fetching user profile:", error);
// // //         }
// // //     };

// // //     const fetchPracticeDetails = async (practiceId) => {
// // //         try {
// // //             const response = await axios.get(`http://127.0.0.1:8000/Practice/${practiceId}/`);

// // //             setPractice(response.data);
// // //         } catch (error) {
// // //             console.error("Error fetching practice details:", error);
// // //         }
// // //     };

// // //     const fetchCampaigns = async () => {
// // //         try {
// // //             const response = await axios.get("http://127.0.0.1:8000/Campaign/")
// // //             setCampaigns(response.data)
// // //         } catch (error) {
// // //             console.error("Error fetching campaigns:", error)
// // //         }
// // //     }

// // //     const sendMessage = async (campaign) => {
// // //         try {
// // //             const response = await axios.get("http://127.0.0.1:8000/UserProfile/", {
// // //                 params: {
// // //                     role: "practiceuser",
// // //                     practice_id: practice.id
// // //                 }
// // //             });
// // //             const practiceUsers = response.data; // Now the backend filters users
// // //             console.log(practiceUsers)
// // //             for (const userProfile of practiceUsers) {
// // //                 try {
// // //                     await axios.post(
// // //                         "http://127.0.0.1:8000/Message/",
// // //                         {
// // //                             userprofile_id: userProfile.id,
// // //                             name: campaign.name,
// // //                             type: campaign.type,
// // //                             description: campaign.description,
// // //                             status: campaign.status,
// // //                         },
// // //                         {
// // //                             headers: {
// // //                                 Authorization: `Bearer ${authTokens.access}`,
// // //                             },
// // //                         },
// // //                     )
// // //                     console.log(`Message sent to userProfile ${userProfile.id}`)
// // //                 } catch (error) {
// // //                     console.error(`Error sending message to userProfile ${userProfile.id}:`, error)
// // //                 }
// // //             }
// // //         } catch (error) {
// // //             console.error("Error fetching user profiles:", error)
// // //         }
// // //     }


// // //     return (
// // //         <div className="admin-dashboard">
// // //             {practice && (
// // //                 <h1 className="practice-info">{practice.name}</h1>
// // //             )}
// // //             <h2>Admin Dashboard</h2>

// // //             <div className="campaigns-section">
// // //                 <h2>Available Campaigns</h2>
// // //                 {campaigns.length > 0 ? (
// // //                     <ul className="campaign-list-a">
// // //                         {campaigns.map((campaign) => (
// // //                             <li key={campaign.id} className="campaign-card">
// // //                                 <h3>{campaign.name}</h3>
// // //                                 <p className="campaign-description">{campaign.description}</p>
// // //                                 <div className="campaign-details">
// // //                                     <p>
// // //                                         <strong>Type:</strong> {campaign.type}
// // //                                     </p>
// // //                                     <p>
// // //                                         <strong>Status:</strong> {campaign.status}
// // //                                     </p>
// // //                                 </div>
// // //                                 <button onClick={() => sendMessage(campaign)} className="send-message-btn">
// // //                                     Send Messages
// // //                                 </button>
// // //                             </li>
// // //                         ))}
// // //                     </ul>
// // //                 ) : (
// // //                     <p className="no-campaigns">No campaigns found.</p>
// // //                 )}
// // //             </div>
// // //         </div>
// // //     )
// // // }

