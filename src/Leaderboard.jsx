import React, { useState, useEffect } from 'react';
import './leaderboard.css'; // <-- 1. Imports the new CSS file

// We can't import from a URL, and we can't edit index.html.
// So, we will dynamically load the script.
const SUPABASE_CDN_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';


// --- Supabase Setup ---
// 2. Reads the keys from your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


// --- Hard-coded App Data ---
const genericAvatar = 'https://placehold.co/40x40/B0B0B0/FFFFFF?text=P&font=roboto';
const TOTAL_BADGES = 20;

const SkillBadgeProgress = ({ badges, total }) => {
    const percentage = (badges / total) * 100;
    return (
        <div className="progress-bar-container">
            <div
                className="progress-bar-fill"
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

// 3. Renamed the component to 'Leaderboard'
const Leaderboard = () => {
    // New state for the loaded client
    const [supabase, setSupabase] = useState(null);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null); // State for errors

    // 3. Add useEffect to load the Supabase script
    useEffect(() => {
        // Add a check for placeholder values
        if (supabaseUrl === undefined || supabaseKey === undefined) {
            console.error("Supabase URL/Key not set. Please update your .env file.");
            setFetchError("Please add your Supabase URL and Key to the .env file.");
            setLoading(false);
            return; // Stop right here
        }

        // Check if script is already loaded by window object
        if (window.supabase) {
            console.log("Supabase already loaded.");
            if (!supabase) { // Set client only if not already set in state
                setSupabase(window.supabase.createClient(supabaseUrl, supabaseKey));
            }
            return;
        }

        // Check if script tag is already being loaded
        let script = document.querySelector(`script[src="${SUPABASE_CDN_URL}"]`);
        
        const handleLoad = () => {
            console.log("Supabase script loaded successfully.");
            if (window.supabase) {
                // Script loaded, now create and set the client
                setSupabase(window.supabase.createClient(supabaseUrl, supabaseKey));
            } else {
                console.error("Supabase script loaded but window.supabase is not found.");
                setFetchError("Could not initialize database. Client not found after load.");
                setLoading(false);
            }
        };

        const handleError = () => {
            console.error("Failed to load Supabase script.");
            setFetchError("Failed to load database library. Check network connection.");
            setLoading(false);
        };

        if (!script) {
            console.log("Creating and loading Supabase script.");
            script = document.createElement('script');
            script.src = SUPABASE_CDN_URL;
            script.async = true;
            // Add listeners *before* appending
            script.addEventListener('load', handleLoad);
            script.addEventListener('error', handleError);
            document.head.appendChild(script);
        } else {
            // Script tag exists, but maybe it's still loading
            // Add listeners to the existing script tag
            console.log("Supabase script tag already exists, attaching listeners.");
            script.addEventListener('load', handleLoad);
            script.addEventListener('error', handleError);
        }

        // Cleanup function
        return () => {
            if (script) {
                script.removeEventListener('load', handleLoad);
                script.removeEventListener('error', handleError);
            }
        };
    }, []); // Runs only once

    // 4. Update data-fetching useEffect to depend on 'supabase' client
    useEffect(() => {
        // Only run if the supabase client is ready
        if (supabase) {
            async function fetchLeaderboard() {
                // Set loading to true *before* fetching
                setLoading(true);
                setFetchError(null); // Clear previous errors
                
                // Fetch name and badges. Order by badges.
                const { data, error } = await supabase
                    .from('leaderboard')
                    .select('name, badges') // FIX: Only select columns that exist
                    .order('badges', { ascending: false });

                if (error) {
                    console.error('Error fetching data:', error);
                    setFetchError(error.message); // Set the error message
                } else {
                    // 5. Add the 'rank', 'total', and 'avatar' to the data
                    const rankedData = data.map((item, index) => ({
                        ...item,
                        id: item.name, // FIX: Use name as key, since ID wasn't created
                        rank: index + 1,
                        total: TOTAL_BADGES, // Add hard-coded total
                        avatar: genericAvatar, // Add hard-coded avatar
                    }));
                    setLeaderboardData(rankedData);
                }
                // Set loading to false *after* fetch is complete (success or error)
                setLoading(false);
            }

            fetchLeaderboard();
        }
    }, [supabase]); // Re-run this effect ONLY when the supabase client is ready

    // *** Error check for setup ***
    if (fetchError === "Please add your Supabase URL and Key to the .env file.") {
        return (
            <div className="app-container">
                <div className="container content-wrap" style={{ 
                    padding: '2rem', 
                    textAlign: 'center', 
                    backgroundColor: 'white', 
                    borderRadius: '1rem',
                    border: '2px solid #ef4444',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                        Setup Incomplete
                    </h1>
                    <p style={{ color: '#4b5563', marginTop: '1rem', fontSize: '1.125rem' }}>
                        Please add your Supabase URL and Key to the <strong>.env</strong> file.
                    </p>
                    <p style={{ color: '#6b7280', marginTop: '1rem' }}>
                        You must create a <strong>.env</strong> file in your project's root folder and add your keys as <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong>.
                    </p>
                    <p style={{ color: '#6b7280', marginTop: '1rem' }}>
                        After you save the file, you **must restart your server** (`npm run dev`).
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            {/* 4. Removed the <AppStyles /> component */}
            
            <nav>
                <div className="container nav-content">
                    <div className="logo-container">
                        {/* You can put your <img> tag here as we discussed */}
                        <svg className="logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                        <span className="logo-text">GDG Logo</span>
                    </div>
                </div>
            </nav>

            <div className="container content-wrap">
                <header>
                    <div className="header-card">
                        <div className="header-gradient-border"></div>
                        <h2 className="header-subtitle">
                            <span className="gdg-logo-text-g">G</span>
                            <span className="gdg-logo-text-d">D</span>
                            <span className="gdg-logo-text-g2">G</span> 
                            <span className="gdg-logo-text-o"> on Campus ASIET</span>
                        </h2>
                        <h1 className="header-title">Skill Badge Leaderboard</h1>
                        <p className="header-description">Celebrating our community's learning achievements!</p>
                    </div>
                </header>

                <div className="table-container">
                    <div className="table-scroll">
                        {/* 6. Handle Loading and Empty States */}
                        {loading ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                Loading Leaderboard...
                            </div>
                        ) : fetchError ? ( // Show error if one occurred
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444', fontWeight: 'bold' }}>
                                Error: {fetchError}
                            </div>
                        ) : leaderboardData.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                No data found. Add some users to your 'leaderboard' table in Supabase.
                            </div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Name</th>
                                        <th>Skill Badges (Out of 20)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboardData.map((user) => (
                                        <tr key={user.name}> {/* FIX: Use name as key */}
                                            <td>
                                                <span className={`rank-span ${user.rank <= 3 ? 'rank-span-top3' : ''}`}>{user.rank}</span>
                                            </td>
                                            <td>
                                                <div className="user-info">
                                                    <img className="avatar" src={user.avatar} alt={`${user.name}'s avatar`} />
                                                    <div className="user-name">{user.name}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="progress-cell">
                                                    <SkillBadgeProgress badges={user.badges} total={user.total} />
                                                    <span className="progress-text">{user.badges}/{user.total}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard; // 5. Export the new component name