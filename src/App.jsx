import React, { useState, useEffect } from 'react';
import Leaderboard from './Leaderboard';
import { Routes, Route, Navigate } from 'react-router-dom';

const App = () => {

    return (
        <Routes>
            
            <Route path="/" element={<Leaderboard />} />

        </Routes>
    );
};

export default App;

