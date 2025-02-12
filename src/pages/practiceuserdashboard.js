

import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import "./userdashboard.css";

export default function UserDashboard() {
    const { authTokens, user } = useContext(AuthContext);
    const [practice, setPractice] = useState(null);
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {

        // if (user.role !== "practiceuser") {
        //     navigate("/unauth");
        //     return;
        // }

        fetchUserProfile();
        fetchMessages();
    }, []);

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

    const fetchMessages = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/Message/", {
                headers: {
                    Authorization: `Bearer ${authTokens.access}`,
                },
            });
            setMessages(response.data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleMessageClick = async (message) => {
        // If the message is already seen, just select it
        console.log('called')
        if (message.seen === "yes") {
            setSelectedMessage(message);
            return;
        }

        try {
            // Update the message's seen status to "yes"
            await axios.put(
                `http://127.0.0.1:8000/Message/${message.id}/`,
                { seen: "yes" },
                {
                    headers: {
                        Authorization: `Bearer ${authTokens.access}`,
                    },
                }
            );

            // Update local state to reflect seen status change
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === message.id ? { ...msg, seen: "yes" } : msg
                )
            );

            setSelectedMessage({ ...message, seen: "yes" });
        } catch (error) {
            console.error("Error updating message seen status:", error);
        }
    };

    const deleteMessage = async (messageId) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/Message/${messageId}/`, {
                headers: {
                    Authorization: `Bearer ${authTokens.access}`,
                },
            });
            setMessages(messages.filter((msg) => msg.id !== messageId));
            setSelectedMessage(null);
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };

    return (
        <div className="user-dashboard">
            {practice && <h1 className="practice-info">{practice.name}</h1>}
            <header className="dashboard-header">
                <h1>Inbox</h1>
            </header>
            <div className="inbox-container">
                <div className="message-list">
                    {messages.length > 0 ? (
                        <ul>
                            {messages.map((message) => (
                                <li
                                    key={message.id}
                                    className={`message-item ${selectedMessage && selectedMessage.id === message.id ? "selected" : ""} ${message.seen === "no" ? "unread" : ""
                                        }`}
                                    onClick={() => handleMessageClick(message)}
                                >
                                    <div className="message-icon">{message.name[0].toUpperCase()}</div>
                                    <div className="message-preview">
                                        <h3>{message.name}</h3>
                                        <p>{message.description.substring(0, 50)}...</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-messages">No messages found.</p>
                    )}
                </div>
                <div className="message-details">
                    {selectedMessage ? (
                        <div>
                            <h2>{selectedMessage.name}</h2>
                            <p>
                                <strong>Type:</strong> {selectedMessage.type}
                            </p>
                            <p>
                                <strong>Status:</strong> {selectedMessage.status}
                            </p>
                            <p>{selectedMessage.description}</p>
                            <button className="delete-button" onClick={() => deleteMessage(selectedMessage.id)}>
                                Delete
                            </button>
                        </div>
                    ) : (
                        <p>Select a message to view details</p>
                    )}
                </div>
            </div>
        </div >
    );
}






