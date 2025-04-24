import React, { useState, useEffect } from 'react';
import './App.css';
import Header from '../components/Header/Header';
import { useLocation } from 'react-router-dom'; // Import useLocation

function App() {
    const location = useLocation();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (location.state?.message) {
            setStats(location.state);
            const timer = setTimeout(() => {
                setStats(null); // Clear the stats after 4 seconds
            }, 4000);

            return () => clearTimeout(timer);
        } else {
            setStats(null); // Reset stats if location.state is null or undefined
        }
    }, [location.state]); // Ensure location.state is a dependency

    return (
        <div className="app-container">
            {stats?.message && (
                <div className="message">
                    <p>{stats.message}</p>
                </div>
            )}
            
            <Header isUser={stats?.isUser ?? false} />
        </div>
    );
}

export default App;