import React, { useState, useEffect } from 'react';
import './App.css';
import Header from '../components/Header/Header';
import { useLocation } from 'react-router-dom'; // Import useLocation
import List from '../components/Posts/List/List';

function App() {
    const location = useLocation();
    const data = location.state
    const [stats, setStats] = useState(null);
    useEffect(() => {
        if (location.state?.message) {
            setStats(location.state);
            const timer = setTimeout(() => {
                setStats(null);
            }, 4000);

            return () => clearTimeout(timer);
        } else {
            setStats(null); // Reset stats if location.data is null or undefined
        }
    }, [location.state]); // Ensure location.data is a dependency

    return (
        <div className="app-container">
            {stats?.message && (
                <div className="message">
                    <p>{stats.message}</p>
                </div>
            )}
            
            <Header isUser={data?.isUser} UserID={data?.UserID} ThisUserID={data?.ThisUserID} Type={data?.Type} />

            <List  ThisUserID={data?.ThisUserID} />
        </div>
    );
}

export default App;