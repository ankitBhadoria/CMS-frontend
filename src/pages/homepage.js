// export default function Homepage() {
//     return (
//         <h1>Welcome!!!</h1>
//     );
// }

import './homepage.css'

export default function Homepage() {
    return (
        <div className="homepage">

            <main className="main-content">
                <section className="welcome-section">
                    <h2>Welcome to Your Practice Management System</h2>
                    <p>Streamline your medical practice with our comprehensive management solution.</p>
                </section>

                <section className="features">
                    <div className="feature-card">
                        <h3>Patient Management</h3>
                        <p>Easily manage patient records, history, and appointments.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Appointment Scheduling</h3>
                        <p>Efficiently schedule and manage appointments for your practice.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Billing and Invoicing</h3>
                        <p>Streamline your billing process with our integrated invoicing system.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Reporting and Analytics</h3>
                        <p>Gain insights into your practice with comprehensive reporting tools.</p>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <p>&copy; 2025 Practice Management System. All rights reserved.</p>
            </footer>
        </div>
    )
}

