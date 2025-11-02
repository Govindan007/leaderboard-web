import React, { useState, useEffect } from 'react';
// import './leaderboard.css'; // <-- Reverted to fix build error

// We can't import from a URL, and we can't edit index.html.
// So, we will dynamically load the script.
const SUPABASE_CDN_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';

// --- Supabase Setup ---
// 1. Reverted from .env for Canvas. Use .env in your local project!
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// --- Hard-coded App Data ---
const genericAvatar = 'https://placehold.co/40x40/B0B0B0/FFFFFF?text=P&font=roboto';
const TOTAL_BADGES = 20;

// --- CSS Styles ---
// Merged leaderboard.css back into this file to fix build error
const AppStyles = () => (
  <style>{`
    /* --- General Styles --- */
    .app-container {
      background-color: #f3f4f6;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1f2937;
    }
    .container {
      width: 100%;
      max-width: 1024px;
      margin-left: auto;
      margin-right: auto;
      padding-left: 1rem;
      padding-right: 1rem;
    }

    /* --- Navbar --- */
    nav {
      background-color: white;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .nav-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      padding-bottom: 1rem;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .logo-icon {
      width: 2rem;
      height: 2rem;
      color: #2563eb;
    }
    .logo-text {
      font-size: 1.25rem;
      font-weight: bold;
      color: #1f2937;
    }
    .content-wrap {
      padding-top: 2rem;
      padding-bottom: 2rem;
    }

    /* --- Header Card --- */
    header {
      max-width: 95%; /* Make it 95% of the container width */
      margin-left: auto;
      margin-right: auto;
    }
    .header-card {
      text-align: center;
      margin-bottom: 2rem;
      background-color: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(0, 0, 0, 0.05);
      position: relative;
      overflow: hidden;
    }
    .header-gradient-border {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background-image: linear-gradient(to right, #3b82f6, #ef4444, #f59e0b);
    }
    .header-subtitle {
      font-size: 1.5rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
    }
    .gdg-logo-text-g { color: #3b82f6; }
    .gdg-logo-text-d { color: #ef4444; }
    .gdg-logo-text-g2 { color: #eab308; }
    .gdg-logo-text-o { color: #22c55e; }

    .header-title {
      font-size: 2.5rem;
      font-weight: 800;
      background-image: linear-gradient(to right, #2563eb, #16a34a, #f59e0b);
      color: transparent;
      -webkit-background-clip: text;
      background-clip: text;
      padding-bottom: 0.5rem;
    }
    .header-description {
      color: #4b5563;
      font-size: 1.125rem;
      margin-top: 0.75rem;
    }

    /* --- Table --- */
    .table-container {
      background-color: white;
      border-radius: 0.75rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    .table-scroll {
      overflow-x: auto;
    }
    table {
      width: 100%;
      text-align: left;
    }
    thead {
      background-color: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      padding: 0.75rem 1.5rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    tbody {
      divide-y: 1px solid #e5e7eb;
    }
    tr:hover {
      background-color: #f9fafb;
    }
    td {
      padding: 1rem 1.5rem;
      white-space: nowrap;
      vertical-align: middle;
    }
    .rank-span {
      font-size: 1.125rem;
      font-weight: bold;
      color: #6b7280;
    }
    .rank-span-top3 {
      color: #f59e0b;
    }
    .user-info {
      display: flex;
      align-items: center;
    }
    .avatar {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 9999px;
      flex-shrink: 0;
    }
    .user-name {
      margin-left: 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #111827;
    }
    .progress-cell {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .progress-text {
      font-size: 0.875rem;
      color: #4b5563;
      font-weight: 600;
    }

    /* --- Progress Bar --- */
    .progress-bar-container {
      width: 12rem; /* 192px */
      background-color: #e5e7eb;
      border-radius: 9999px;
      height: 1rem;
      box-shadow: inset 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
    .progress-bar-fill {
      background-color: #22c55e;
      height: 1rem;
      border-radius: 9999px;
      transition: width 0.5s ease-out;
    }
  `}</style>
);

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

// Renamed from 'App' to 'Leaderboard' to match the file
const Leaderboard = () => { 
    // New state for the loaded client
    const [supabase, setSupabase] = useState(null);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null); // State for errors

    // 3. Add useEffect to load the Supabase script
    useEffect(() => {
        // Add a check for placeholder values
        // Updated this check to look for the placeholder strings again
        if (supabaseUrl === 'YOUR_SUPABASE_PROJECT_URL' || supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
            console.error("Supabase URL/Key not set. Please update the variables in the code.");
            setFetchError("Please paste your Supabase URL and Key into the code.");
            setLoading(false);
            return; // Stop right here
        }

        // Check if script is already loaded by window object
        if (window.supabase) {
            if (!supabase) { 
                setSupabase(window.supabase.createClient(supabaseUrl, supabaseKey));
            }
            return;
        }

        // Check if script tag is already being loaded
        let script = document.querySelector(`script[src="${SUPABASE_CDN_URL}"]`);
        
        const handleLoad = () => {
            if (window.supabase) {
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
            script = document.createElement('script');
            script.src = SUPABASE_CDN_URL;
            script.async = true;
            script.addEventListener('load', handleLoad);
            script.addEventListener('error', handleError);
            document.head.appendChild(script);
        } else {
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
    }, []); 

    // 4. Update data-fetching useEffect to depend on 'supabase' client
    useEffect(() => {
        // Only run if the supabase client is ready
        if (supabase) {
            async function fetchLeaderboard() {
                setLoading(true);
                setFetchError(null); 
                
                // --- 1. MODIFICATION: Fetch the new 'all' column ---
                const { data, error } = await supabase
                    .from('leaderboard')
                    .select('name, badges, all') // <-- Added 'all'
                    .order('badges', { ascending: false });

                if (error) {
                    console.error('Error fetching data:', error);
                    setFetchError(error.message); 
                } else {
                    // --- 2. MODIFICATION: Add logic for the 'all' column ---
                    const rankedData = data.map((item, index) => {
                        // Check if the 'all' column is 'Yes'
                        const completedAll = item.all === 'Yes';
                        
                        // Set the badge count based on the new logic
                        const displayBadges = completedAll ? TOTAL_BADGES : item.badges;
                        
                        return {
                            ...item,
                            id: item.name, 
                            rank: index + 1,
                            badges: displayBadges, // <-- Use the new overriden value
                            total: TOTAL_BADGES, 
                            avatar: genericAvatar, 
                        };
                    });
                    
                    // --- 3. MODIFICATION: Re-sort the data ---
                    // We must re-sort here because someone with 'Yes' might
                    // have a low badge count but should be at the top.
                    const sortedData = rankedData.sort((a, b) => b.badges - a.badges);
                    
                    // Re-rank the sorted data
                    const finalData = sortedData.map((item, index) => ({
                        ...item,
                        rank: index + 1,
                    }));

                    setLeaderboardData(finalData);
                }
                setLoading(false);
            }

            fetchLeaderboard();
        }
    }, [supabase]); 

    // If the error is the setup message, render a special error component
    if (fetchError === "Please paste your Supabase URL and Key into the code.") {
        return (
            <div className="app-container">
                <AppStyles /> {/* Added styles here */}
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
                        Please paste your Supabase URL and Key into the code.
                    </p>
                    <p style={{ color: '#6b7280', marginTop: '1rem' }}>
                        You need to replace <strong>'YOUR_SUPABASE_PROJECT_URL'</strong> and <strong>'YOUR_SUPABASE_ANON_KEY'</strong> in your <strong>leaderboard.jsx</strong> file (lines 12 and 13) with the real keys from your Supabase dashboard.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">    
            <AppStyles /> {/* Added styles here */}
            
            <nav>
                <div className="container nav-content">
                    <div className="logo-container">
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
                        {loading ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                Loading Leaderboard...
                            </div>
                        ) : fetchError ? ( 
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
                                        <tr key={user.name}> 
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

export default Leaderboard;

