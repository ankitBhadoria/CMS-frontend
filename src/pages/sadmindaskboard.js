import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import the CSS for the date picker
import "./sadashboard.css";

export default function SAdminDashboard() {
    const { user, authTokens } = useContext(AuthContext);
    const [campaigns, setCampaigns] = useState([]); // For normal campaigns (Super Admin)
    const [adminCampaigns, setAdminCampaigns] = useState([]); // For Admin Campaigns
    const [practices, setPractices] = useState([]); // For practices
    const [selectedPractice, setSelectedPractice] = useState(""); // Selected practice
    const [selectedPracticeUsers, setSelectedPracticeUsers] = useState([]);
    const [newCampaign, setNewCampaign] = useState({ name: "", description: "", type: "", status: "" });
    const [editingCampaignId, setEditingCampaignId] = useState(null);
    const [editingAdminCampaignId, setEditingAdminCampaignId] = useState(null);
    const [editingAdminCampaign, setEditingAdminCampaign] = useState(null); // Store Admin Campaign for inline editing
    const [scheduleDate, setScheduleDate] = useState(null);  // Add state for scheduled date and time
    const navigate = useNavigate();

    useEffect(() => {

        // if (user.role !== "superadmin") {
        //     navigate("/unauth");
        //     return;
        // }

        fetchCampaigns(); // Fetch normal campaigns (Super Admin)
        fetchPractices(); // Fetch practices for practice selection
    }, []);

    const fetchCampaigns = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/Campaign/",
                { headers: { Authorization: `Bearer ${authTokens.access}` } }
            );
            setCampaigns(response.data); // Fetch Super Admin campaigns
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        }
    };

    const fetchPractices = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/Practice/");
            setPractices(response.data);
        } catch (error) {
            console.error("Error fetching practices:", error);
        }
    };

    const fetchAdminCampaigns = async (practiceId) => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/AdminCampaign/", {
                headers: { Authorization: `Bearer ${authTokens.access}` },
                params: { practice_id: practiceId }, // Send practice_id to get AdminCampaigns
            });
            setAdminCampaigns(response.data);
        } catch (error) {
            console.error("Error fetching admin campaigns:", error);
        }
    };

    const handleCreateCampaign = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://127.0.0.1:8000/Campaign/", newCampaign, { headers: { Authorization: `Bearer ${authTokens.access}` } });
            setNewCampaign({ name: "", description: "", type: "", status: "" });
            fetchCampaigns(); // Fetch campaigns after creating a new one
        } catch (error) {
            console.error("Error creating campaign:", error);
        }
    };

    const handleUpdateSuperAdminCampaign = async (e, updatedCampaign) => {
        e.preventDefault();
        try {
            await axios.put(
                `http://127.0.0.1:8000/Campaign/${updatedCampaign.id}/`,
                updatedCampaign,
                { headers: { Authorization: `Bearer ${authTokens.access}` } }
            );
            setEditingCampaignId(null);
            fetchCampaigns(); // Fetch updated campaigns
        } catch (error) {
            console.error("Error updating Super Admin campaign:", error);
        }
    };

    const handleDeleteSuperAdminCampaign = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/Campaign/${id}/`, {
                headers: { Authorization: `Bearer ${authTokens.access}` },
            });
            fetchCampaigns(); // Fetch updated campaigns after deletion
        } catch (error) {
            console.error("Error deleting Super Admin campaign:", error);
        }
    };

    const handleUpdateAdminCampaign = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `http://127.0.0.1:8000/AdminCampaign/${editingAdminCampaign.id}/`,
                editingAdminCampaign,
                { headers: { Authorization: `Bearer ${authTokens.access}` } }
            );
            setEditingAdminCampaignId(null);
            fetchAdminCampaigns(selectedPractice); // Fetch updated AdminCampaigns
        } catch (error) {
            console.error("Error updating Admin campaign:", error);
        }
    };

    const handleDeleteAdminCampaign = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/AdminCampaign/${id}/`, {
                headers: { Authorization: `Bearer ${authTokens.access}` },
            });
            fetchAdminCampaigns(selectedPractice); // Fetch updated AdminCampaigns after deletion
        } catch (error) {
            console.error("Error deleting Admin campaign:", error);
        }
    };

    const sendMessageToUsers = async (campaign) => {
        if (!selectedPractice) {
            alert("Please select a practice.");
            return;
        }

        try {
            const response = await axios.get("http://127.0.0.1:8000/UserProfile/", {
                params: {
                    role: "practiceuser",
                    practice_id: selectedPractice
                }
            });

            const practiceUsers = response.data;
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

    const handleScheduleMessage = async (campaign) => {
        if (!selectedPractice) {
            alert("Please select a practice.");
            return;
        }
        if (!scheduleDate) {
            alert("Please select a schedule date and time.");
            return;
        }
        try {
            const response = await axios.get("http://127.0.0.1:8000/UserProfile/", {
                params: {
                    role: "practiceuser",
                    practice_id: selectedPractice
                }
            });

            const practiceUsers = response.data;
            setSelectedPracticeUsers(practiceUsers);
            const scheduledDate = scheduleDate.toISOString();



            for (const userProfile of practiceUsers) {
                console.log(userProfile.id,
                    campaign.name,
                    campaign.type,
                    campaign.description,
                    campaign.status,
                    scheduledDate,)
                try {
                    await axios.post(
                        "http://127.0.0.1:8000/Messagescheduled/",
                        {
                            userprofile_id: userProfile.id,
                            name: campaign.name,
                            type: campaign.type,
                            description: campaign.description,
                            status: campaign.status,
                            scheduled_date: scheduledDate,
                            // created_by: user.id
                        },
                        {
                            headers: { Authorization: `Bearer ${authTokens.access}` },
                        }
                    );
                    console.log(`Message scheduled for userProfile ${userProfile.id}`);
                    setScheduleDate(null);
                } catch (error) {
                    console.error(`Error scheduling message to userProfile ${userProfile.id}:`, error);
                }
            }
        } catch (error) {
            console.error("Error fetching user profiles:", error);
        }

        // try {
        //     // Convert the date to ISO format before sending
        //     const scheduledDate = scheduleDate.toISOString();

        //     const response = await axios.post(
        //         "http://127.0.0.1:8000/Message/scheduled/",
        //         {
        //             userprofile_id: userProfile.id,
        //             name: campaign.name,
        //             type: campaign.type,
        //             description: campaign.description,
        //             status: campaign.status,
        //             scheduled_time: scheduledDate,
        //         },
        //         { headers: { Authorization: `Bearer ${authTokens.access}` } }
        //     );

        //     console.log(`Message scheduled for ${scheduledDate}`);
        //     // Reset the schedule date after the request
        //     setScheduleDate(null);
        // } catch (error) {
        //     console.error("Error scheduling message:", error);
        // }
    };

    return (
        <div className="admin-dashboard">
            <header>
                <h1>Super Admin Dashboard</h1>
            </header>

            <main>

                {/* Create Campaign Section */}
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
                        </select>
                        <button type="submit">Create Campaign</button>
                    </form>
                </section>

                {/* Super Admin Campaigns Section */}
                <section className="superadmin-campaign-list">
                    <h2>Super Admin Campaigns</h2>
                    {campaigns.length > 0 ? (
                        <ul>
                            {campaigns.map((campaign) => (
                                <li key={campaign.id} className="campaign-card">
                                    {editingCampaignId === campaign.id ? (
                                        // Inline Edit Form for Super Admin Campaign
                                        <form onSubmit={(e) => handleUpdateSuperAdminCampaign(e, campaign)}>
                                            <input
                                                type="text"
                                                value={campaign.name}
                                                onChange={(e) => setCampaigns(campaigns.map(c => c.id === campaign.id ? { ...c, name: e.target.value } : c))}
                                                required
                                            />
                                            <textarea
                                                value={campaign.description}
                                                onChange={(e) => setCampaigns(campaigns.map(c => c.id === campaign.id ? { ...c, description: e.target.value } : c))}
                                                required
                                            />
                                            <input
                                                type="text"
                                                value={campaign.type}
                                                onChange={(e) => setCampaigns(campaigns.map(c => c.id === campaign.id ? { ...c, type: e.target.value } : c))}
                                                required
                                            />
                                            <select
                                                value={campaign.status}
                                                onChange={(e) => setCampaigns(campaigns.map(c => c.id === campaign.id ? { ...c, status: e.target.value } : c))}
                                                required
                                            >
                                                <option value="upcoming">Upcoming</option>
                                                <option value="running">Running</option>
                                            </select>
                                            <button type="submit">Save</button>
                                            <button type="button" className="cancel" onClick={() => setEditingCampaignId(null)}>Cancel</button>
                                        </form>
                                    ) : (
                                        // Display Super Admin Campaign Details
                                        <>
                                            <h3>{campaign.name}</h3>
                                            <p>{campaign.description}</p>
                                            <p>Type: {campaign.type}</p>
                                            <p>Status: {campaign.status}</p>
                                            <div className="button-group">
                                                <select
                                                    value={selectedPractice}
                                                    onChange={(e) => setSelectedPractice(e.target.value)}
                                                >
                                                    <option value="">Select Practice</option>
                                                    {practices.map((practice) => (
                                                        <option key={practice.id} value={practice.id}>{practice.name}</option>
                                                    ))}
                                                </select>
                                                <button onClick={() => sendMessageToUsers(campaign)}>Send</button>
                                                <button onClick={() => setEditingCampaignId(campaign.id)}>Edit</button>
                                                <button className="btn-dlt" onClick={() => handleDeleteSuperAdminCampaign(campaign.id)}>Delete</button>
                                                {/* Schedule Message Button */}
                                                <button onClick={() => handleScheduleMessage(campaign)}>Schedule</button>

                                                {/* Date Picker for Scheduling */}
                                                <ReactDatePicker
                                                    selected={scheduleDate}
                                                    onChange={(date) => setScheduleDate(date)}
                                                    dateFormat="Pp"
                                                    placeholderText="Select Date and Time"
                                                    showTimeInput  // ✅ Enables manual time entry
                                                    showTimeSelect={false} // ❌ Hides time picker dropdown
                                                    minDate={new Date()} // ✅ Disable past dates
                                                    portalId="root-portal"
                                                />
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No Super Admin campaigns found.</p>
                    )}
                </section>

                {/* Admin Campaigns for the Selected Practice */}
                <section className="admin-campaign-list">
                    <h2>Practice-Specific Campaigns</h2>
                    {/* Practice Selection Dropdown */}
                    <section className="select-practice">
                        <h2>Select Practice</h2>
                        <select onChange={(e) => {
                            setSelectedPractice(e.target.value);
                            fetchAdminCampaigns(e.target.value); // Fetch AdminCampaigns for selected practice
                        }}>
                            <option value="">---Select Practice---</option>
                            {practices.map((practice) => (
                                <option key={practice.id} value={practice.id}>{practice.name}</option>
                            ))}
                        </select>
                    </section>
                    {adminCampaigns.length > 0 ? (
                        <ul>
                            {adminCampaigns.map((campaign) => (
                                <li key={campaign.id} className="campaign-card">
                                    {editingAdminCampaignId === campaign.id ? (
                                        // Inline Edit Form for Admin Campaign
                                        <form onSubmit={(e) => handleUpdateAdminCampaign(e)}>
                                            <input
                                                type="text"
                                                value={editingAdminCampaign?.name || ''}
                                                onChange={(e) => setEditingAdminCampaign({ ...editingAdminCampaign, name: e.target.value })}
                                                required
                                            />
                                            <textarea
                                                value={editingAdminCampaign?.description || ''}
                                                onChange={(e) => setEditingAdminCampaign({ ...editingAdminCampaign, description: e.target.value })}
                                                required
                                            />
                                            <input
                                                type="text"
                                                value={editingAdminCampaign?.type || ''}
                                                onChange={(e) => setEditingAdminCampaign({ ...editingAdminCampaign, type: e.target.value })}
                                                required
                                            />
                                            <select
                                                value={editingAdminCampaign?.status || ''}
                                                onChange={(e) => setEditingAdminCampaign({ ...editingAdminCampaign, status: e.target.value })}
                                                required
                                            >
                                                <option value="upcoming">Upcoming</option>
                                                <option value="running">Running</option>
                                            </select>
                                            <button type="submit">Save</button>
                                            <button type="button" className="cancel" onClick={() => setEditingAdminCampaignId(null)}>Cancel</button>
                                        </form>
                                    ) : (
                                        // Display Admin Campaign Details
                                        <>
                                            <h3>{campaign.name}</h3>
                                            <p>{campaign.description}</p>
                                            <p>Type: {campaign.type}</p>
                                            <p>Status: {campaign.status}</p>
                                            <div className="button-group">
                                                <button onClick={() => sendMessageToUsers(campaign)}>Send</button>
                                                <button onClick={() => {
                                                    setEditingAdminCampaignId(campaign.id);
                                                    setEditingAdminCampaign({ ...campaign }); // Set the campaign data to be edited
                                                }}>Edit</button>
                                                <button className="btn-dlt" onClick={() => handleDeleteAdminCampaign(campaign.id)}>Delete</button>
                                                {/* Schedule Message Button */}
                                                <button onClick={() => handleScheduleMessage(campaign)}>Schedule</button>

                                                {/* Date Picker for Scheduling */}
                                                <ReactDatePicker
                                                    selected={scheduleDate}
                                                    onChange={(date) => setScheduleDate(date)}
                                                    dateFormat="Pp"
                                                    placeholderText="Select Date and Time"
                                                    showTimeInput  // ✅ Enables manual time entry
                                                    showTimeSelect={false} // ❌ Hides time picker dropdown
                                                    minDate={new Date()} // ✅ Disable past dates
                                                    portalId="root-portal"
                                                />
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No campaigns found for this practice.</p>
                    )}
                </section>
            </main>
        </div>
    );
}



// --------------------------------------------------


// import { useState, useEffect, useContext } from "react";
// import axios from "axios";
// import AuthContext from "../context/AuthContext";
// import "./sadashboard.css";

// export default function SAdminDashboard() {
//     const { authTokens } = useContext(AuthContext);
//     const [campaigns, setCampaigns] = useState([]); // For normal campaigns (Super Admin)
//     const [adminCampaigns, setAdminCampaigns] = useState([]); // For Admin Campaigns
//     const [practices, setPractices] = useState([]); // For practices
//     const [selectedPractice, setSelectedPractice] = useState(""); // Selected practice
//     const [newCampaign, setNewCampaign] = useState({ name: "", description: "", type: "", status: "" });
//     const [editingCampaignId, setEditingCampaignId] = useState(null);
//     const [editingAdminCampaignId, setEditingAdminCampaignId] = useState(null);
//     const [editingAdminCampaign, setEditingAdminCampaign] = useState(null);

//     useEffect(() => {
//         fetchCampaigns(); // Fetch normal campaigns (Super Admin)
//         fetchPractices(); // Fetch practices for practice selection
//     }, []);

//     const fetchCampaigns = async () => {
//         try {
//             const response = await axios.get("http://127.0.0.1:8000/Campaign/");
//             setCampaigns(response.data); // Fetch Super Admin campaigns
//         } catch (error) {
//             console.error("Error fetching campaigns:", error);
//         }
//     };

//     const fetchPractices = async () => {
//         try {
//             const response = await axios.get("http://127.0.0.1:8000/Practice/");
//             setPractices(response.data);
//         } catch (error) {
//             console.error("Error fetching practices:", error);
//         }
//     };

//     const fetchAdminCampaigns = async (practiceId) => {
//         try {
//             const response = await axios.get("http://127.0.0.1:8000/AdminCampaign/", {
//                 headers: { Authorization: `Bearer ${authTokens.access}` },
//                 params: { practice_id: practiceId }, // Send practice_id to get AdminCampaigns
//             });
//             setAdminCampaigns(response.data);
//         } catch (error) {
//             console.error("Error fetching admin campaigns:", error);
//         }
//     };

//     const handleCreateCampaign = async (e) => {
//         e.preventDefault();
//         try {
//             await axios.post("http://127.0.0.1:8000/Campaign/", newCampaign);
//             setNewCampaign({ name: "", description: "", type: "", status: "" });
//             fetchCampaigns(); // Fetch campaigns after creating a new one
//         } catch (error) {
//             console.error("Error creating campaign:", error);
//         }
//     };

//     const handleUpdateSuperAdminCampaign = async (e, updatedCampaign) => {
//         e.preventDefault();
//         try {
//             await axios.put(
//                 `http://127.0.0.1:8000/Campaign/${updatedCampaign.id}/`,
//                 updatedCampaign,
//                 { headers: { Authorization: `Bearer ${authTokens.access}` } }
//             );
//             setEditingCampaignId(null);
//             fetchCampaigns(); // Fetch updated campaigns
//         } catch (error) {
//             console.error("Error updating Super Admin campaign:", error);
//         }
//     };

//     const handleDeleteSuperAdminCampaign = async (id) => {
//         try {
//             await axios.delete(`http://127.0.0.1:8000/Campaign/${id}/`, {
//                 headers: { Authorization: `Bearer ${authTokens.access}` },
//             });
//             fetchCampaigns(); // Fetch updated campaigns after deletion
//         } catch (error) {
//             console.error("Error deleting Super Admin campaign:", error);
//         }
//     };

//     const handleUpdateAdminCampaign = async (e, updatedAdminCampaign) => {
//         e.preventDefault();
//         try {
//             await axios.put(
//                 `http://127.0.0.1:8000/AdminCampaign/${updatedAdminCampaign.id}/`,
//                 updatedAdminCampaign,
//                 { headers: { Authorization: `Bearer ${authTokens.access}` } }
//             );
//             setEditingAdminCampaignId(null);
//             fetchAdminCampaigns(selectedPractice); // Fetch updated AdminCampaigns
//         } catch (error) {
//             console.error("Error updating Admin campaign:", error);
//         }
//     };

//     const handleDeleteAdminCampaign = async (id) => {
//         try {
//             await axios.delete(`http://127.0.0.1:8000/AdminCampaign/${id}/`, {
//                 headers: { Authorization: `Bearer ${authTokens.access}` },
//             });
//             fetchAdminCampaigns(selectedPractice); // Fetch updated AdminCampaigns after deletion
//         } catch (error) {
//             console.error("Error deleting Admin campaign:", error);
//         }
//     };

//     const sendMessageToUsers = async (campaign) => {
//         if (!selectedPractice) {
//             alert("Please select a practice.");
//             return;
//         }

//         try {
//             const response = await axios.get("http://127.0.0.1:8000/UserProfile/", {
//                 params: {
//                     role: "practiceuser",
//                     practice_id: selectedPractice
//                 }
//             });

//             const practiceUsers = response.data;
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
//             <header>
//                 <h1>Super Admin Dashboard</h1>
//             </header>

//             <main>

//                 {/* Create Campaign Section */}
//                 <section className="create-campaign">
//                     <h2>Create New Campaign</h2>
//                     <form onSubmit={handleCreateCampaign}>
//                         <input type="text" placeholder="Campaign Name" value={newCampaign.name} onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })} required />
//                         <textarea placeholder="Campaign Description" value={newCampaign.description} onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })} required />
//                         <input type="text" placeholder="Campaign Type" value={newCampaign.type} onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value })} required />
//                         <select value={newCampaign.status} onChange={(e) => setNewCampaign({ ...newCampaign, status: e.target.value })} required>
//                             <option value="">Select Campaign Status</option>
//                             <option value="upcoming">Upcoming</option>
//                             <option value="running">Running</option>
//                         </select>
//                         <button type="submit">Create Campaign</button>
//                     </form>
//                 </section>

//                 {/* Super Admin Campaigns Section */}
//                 <section className="superadmin-campaign-list">
//                     <h2>Super Admin Campaigns</h2>
//                     {campaigns.length > 0 ? (
//                         <ul>
//                             {campaigns.map((campaign) => (
//                                 <li key={campaign.id} className="campaign-card">
//                                     {editingCampaignId === campaign.id ? (
//                                         // Inline Edit Form for Super Admin Campaign
//                                         <form onSubmit={(e) => handleUpdateSuperAdminCampaign(e, campaign)}>
//                                             <input
//                                                 type="text"
//                                                 value={campaign.name}
//                                                 onChange={(e) => setCampaigns(campaigns.map(c => c.id === campaign.id ? { ...c, name: e.target.value } : c))}
//                                                 required
//                                             />
//                                             <textarea
//                                                 value={campaign.description}
//                                                 onChange={(e) => setCampaigns(campaigns.map(c => c.id === campaign.id ? { ...c, description: e.target.value } : c))}
//                                                 required
//                                             />
//                                             <input
//                                                 type="text"
//                                                 value={campaign.type}
//                                                 onChange={(e) => setCampaigns(campaigns.map(c => c.id === campaign.id ? { ...c, type: e.target.value } : c))}
//                                                 required
//                                             />
//                                             <select
//                                                 value={campaign.status}
//                                                 onChange={(e) => setCampaigns(campaigns.map(c => c.id === campaign.id ? { ...c, status: e.target.value } : c))}
//                                                 required
//                                             >
//                                                 <option value="upcoming">Upcoming</option>
//                                                 <option value="running">Running</option>
//                                             </select>
//                                             <button type="submit">Save</button>
//                                             <button type="button" onClick={() => setEditingCampaignId(null)}>Cancel</button>
//                                         </form>
//                                     ) : (
//                                         // Display Super Admin Campaign Details
//                                         <>
//                                             <h3>{campaign.name}</h3>
//                                             <p>{campaign.description}</p>
//                                             <p>Type: {campaign.type}</p>
//                                             <p>Status: {campaign.status}</p>
//                                             <div className="button-group">
//                                                 <select
//                                                     value={selectedPractice}
//                                                     onChange={(e) => setSelectedPractice(e.target.value)}
//                                                 >
//                                                     <option value="">Select Practice</option>
//                                                     {practices.map((practice) => (
//                                                         <option key={practice.id} value={practice.id}>{practice.name}</option>
//                                                     ))}
//                                                 </select>
//                                                 <button onClick={() => sendMessageToUsers(campaign)}>Send</button>
//                                                 <button onClick={() => setEditingCampaignId(campaign.id)}>Edit</button>
//                                                 <button className="btn-dlt" onClick={() => handleDeleteSuperAdminCampaign(campaign.id)}>Delete</button>
//                                             </div>
//                                         </>
//                                     )}
//                                 </li>
//                             ))}
//                         </ul>
//                     ) : (
//                         <p>No Super Admin campaigns found.</p>
//                     )}
//                 </section>

//                 {/* Admin Campaigns for the Selected Practice */}
//                 <section className="admin-campaign-list">
//                     <h2>Practice-Specific Campaigns</h2>
//                     {/* Select Practice and Fetch Admin Campaigns */}
//                     <section className="select-practice">
//                         <h2>Select Practice</h2>
//                         <select onChange={(e) => {
//                             setSelectedPractice(e.target.value);
//                             fetchAdminCampaigns(e.target.value); // Fetch AdminCampaigns for selected practice
//                         }}>
//                             <option value="">---Select Practice---</option>
//                             {practices.map((practice) => (
//                                 <option key={practice.id} value={practice.id}>{practice.name}</option>
//                             ))}
//                         </select>
//                     </section>
//                     {adminCampaigns.length > 0 ? (
//                         <ul>
//                             {adminCampaigns.map((campaign) => (
//                                 <li key={campaign.id} className="campaign-card">
//                                     {editingAdminCampaignId === campaign.id ? (
//                                         // Inline Edit Form for Admin Campaign
//                                         <form onSubmit={(e) => handleUpdateAdminCampaign(e, campaign)}>
//                                             <input
//                                                 type="text"
//                                                 value={editingAdminCampaign.name}
//                                                 onChange={(e) => setEditingAdminCampaign({ ...editingAdminCampaign, name: e.target.value })}
//                                                 required
//                                             />
//                                             <textarea
//                                                 value={editingAdminCampaign.description}
//                                                 onChange={(e) => setEditingAdminCampaign({ ...editingAdminCampaign, description: e.target.value })}
//                                                 required
//                                             />
//                                             <input
//                                                 type="text"
//                                                 value={editingAdminCampaign.type}
//                                                 onChange={(e) => setEditingAdminCampaign({ ...editingAdminCampaign, type: e.target.value })}
//                                                 required
//                                             />
//                                             <select
//                                                 value={editingAdminCampaign.status}
//                                                 onChange={(e) => setEditingAdminCampaign({ ...editingAdminCampaign, status: e.target.value })}
//                                                 required
//                                             >
//                                                 <option value="upcoming">Upcoming</option>
//                                                 <option value="running">Running</option>
//                                             </select>
//                                             <button type="submit">Save</button>
//                                             <button type="button" onClick={() => setEditingAdminCampaignId(null)}>Cancel</button>
//                                         </form>
//                                     ) : (
//                                         // Display Admin Campaign Details
//                                         <>
//                                             <h3>{campaign.name}</h3>
//                                             <p>{campaign.description}</p>
//                                             <p>Type: {campaign.type}</p>
//                                             <p>Status: {campaign.status}</p>
//                                             <div className="button-group">
//                                                 <button onClick={() => sendMessageToUsers(campaign)}>Send</button>
//                                                 <button onClick={() => setEditingAdminCampaignId(campaign.id)}>Edit</button>
//                                                 <button className="btn-dlt" onClick={() => handleDeleteAdminCampaign(campaign.id)}>Delete</button>
//                                             </div>
//                                         </>
//                                     )}
//                                 </li>
//                             ))}
//                         </ul>
//                     ) : (
//                         <p>No campaigns found for this practice.</p>
//                     )}
//                 </section>
//             </main>
//         </div>
//     );
// }

// -----------------------------------------------------------

// import { useState, useEffect, useContext } from "react";
// import axios from "axios";
// import AuthContext from "../context/AuthContext";
// import "./sadashboard.css";

// export default function SAdminDashboard() {
//     const { authTokens } = useContext(AuthContext);
//     const [campaigns, setCampaigns] = useState([]);
//     const [practices, setPractices] = useState([]);
//     const [selectedPractice, setSelectedPractice] = useState("");
//     const [newCampaign, setNewCampaign] = useState({ name: "", description: "", type: "", status: "" });
//     const [editingCampaignId, setEditingCampaignId] = useState(null);

//     useEffect(() => {
//         fetchCampaigns();
//         fetchPractices();
//     }, []);

//     const fetchCampaigns = async () => {
//         try {
//             const response = await axios.get("http://127.0.0.1:8000/Campaign/");
//             setCampaigns(response.data);
//         } catch (error) {
//             console.error("Error fetching campaigns:", error);
//         }
//     };

//     const fetchPractices = async () => {
//         try {
//             const response = await axios.get("http://127.0.0.1:8000/Practice/");
//             setPractices(response.data);
//         } catch (error) {
//             console.error("Error fetching practices:", error);
//         }
//     };

//     const handleCreateCampaign = async (e) => {
//         e.preventDefault();
//         try {
//             await axios.post("http://127.0.0.1:8000/Campaign/", newCampaign);
//             setNewCampaign({ name: "", description: "", type: "", status: "" });
//             fetchCampaigns();
//         } catch (error) {
//             console.error("Error creating campaign:", error);
//         }
//     };

//     const handleUpdateCampaign = async (e, updatedCampaign) => {
//         e.preventDefault();
//         try {
//             await axios.put(`http://127.0.0.1:8000/Campaign/${updatedCampaign.id}/`, updatedCampaign);
//             setEditingCampaignId(null);
//             fetchCampaigns();
//         } catch (error) {
//             console.error("Error updating campaign:", error);
//         }
//     };

//     const handleDeleteCampaign = async (id) => {
//         try {
//             await axios.delete(`http://127.0.0.1:8000/Campaign/${id}/`);
//             fetchCampaigns();
//         } catch (error) {
//             console.error("Error deleting campaign:", error);
//         }
//     };

//     const sendMessageToUsers = async (campaign) => {
//         if (!selectedPractice) {
//             alert("Please select a practice.");
//             return;
//         }

//         try {
//             const response = await axios.get("http://127.0.0.1:8000/UserProfile/", {
//                 params: {
//                     role: "practiceuser",
//                     practice_id: selectedPractice
//                 }
//             });
//             const practiceUsers = response.data; // Now the backend filters users
//             console.log(practiceUsers)
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
//                             headers: {
//                                 Authorization: `Bearer ${authTokens.access}`,
//                             },
//                         },
//                     )
//                     console.log(`Message sent to userProfile ${userProfile.id}`)
//                 } catch (error) {
//                     console.error(`Error sending message to userProfile ${userProfile.id}:`, error)
//                 }
//             }
//         } catch (error) {
//             console.error("Error fetching user profiles:", error)
//         }
//     };

//     return (
//         <div className="admin-dashboard">
//             <header>
//                 <h1>Super Admin Dashboard</h1>
//             </header>

//             <main>
//                 {/* Create Campaign Section */}
//                 <section className="create-campaign">
//                     <h2>Create New Campaign</h2>
//                     <form onSubmit={handleCreateCampaign}>
//                         <input type="text" placeholder="Campaign Name" value={newCampaign.name} onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })} required />
//                         <textarea placeholder="Campaign Description" value={newCampaign.description} onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })} required />
//                         <input type="text" placeholder="Campaign Type" value={newCampaign.type} onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value })} required />
//                         <select value={newCampaign.status} onChange={(e) => setNewCampaign({ ...newCampaign, status: e.target.value })} required>
//                             <option value="">Select Campaign Status</option>
//                             <option value="upcoming">Upcoming</option>
//                             <option value="running">Running</option>
//                         </select>
//                         <button type="submit">Create Campaign</button>
//                     </form>
//                 </section>

//                 {/* List of Campaigns with Inline Editing */}
//                 <section className="campaign-list">
//                     <h2>List of Campaigns</h2>
//                     {campaigns.length > 0 ? (
//                         <ul>
//                             {campaigns.map((campaign) => (
//                                 <li key={campaign.id} className="campaign-card">
//                                     {editingCampaignId === campaign.id ? (
//                                         // Edit Form (Inline)
//                                         <form onSubmit={(e) => handleUpdateCampaign(e, campaign)}>
//                                             <input
//                                                 type="text"
//                                                 value={campaign.name}
//                                                 onChange={(e) => setCampaigns(campaigns.map(c => c.id === campaign.id ? { ...c, name: e.target.value } : c))}
//                                                 required
//                                             />
//                                             <textarea
//                                                 value={campaign.description}
//                                                 onChange={(e) => setCampaigns(campaigns.map(c => c.id === campaign.id ? { ...c, description: e.target.value } : c))}
//                                                 required
//                                             />
//                                             <input
//                                                 type="text"
//                                                 value={campaign.type}
//                                                 onChange={(e) => setCampaigns(campaigns.map(c => c.id === campaign.id ? { ...c, type: e.target.value } : c))}
//                                                 required
//                                             />
//                                             <select
//                                                 value={campaign.status}
//                                                 onChange={(e) => setCampaigns(campaigns.map(c => c.id === campaign.id ? { ...c, status: e.target.value } : c))}
//                                                 required
//                                             >
//                                                 <option value="upcoming">Upcoming</option>
//                                                 <option value="running">Running</option>
//                                             </select>
//                                             <button type="submit">Save</button>
//                                             <button type="button" onClick={() => setEditingCampaignId(null)}>Cancel</button>
//                                         </form>
//                                     ) : (
//                                         // Display Campaign Details
//                                         <>
//                                             <h3>{campaign.name}</h3>
//                                             <p>{campaign.description}</p>
//                                             <p>Type: {campaign.type}</p>
//                                             <p>Status: {campaign.status}</p>
//                                             <div className="button-group">
//                                                 <select onChange={(e) => setSelectedPractice(e.target.value)}>
//                                                     <option value="">---Select Practice---</option>
//                                                     {practices.map((practice) => (
//                                                         <option key={practice.id} value={practice.id}>{practice.name}</option>
//                                                     ))}
//                                                 </select>
//                                                 <button onClick={() => sendMessageToUsers(campaign)}>Send</button>
//                                                 <button onClick={() => setEditingCampaignId(campaign.id)}>Edit</button>
//                                                 <button onClick={() => handleDeleteCampaign(campaign.id)}>Delete</button>
//                                             </div>
//                                         </>
//                                     )}
//                                 </li>
//                             ))}
//                         </ul>
//                     ) : (
//                         <p>No campaigns found.</p>
//                     )}
//                 </section>
//             </main>
//         </div>
//     );
// }







