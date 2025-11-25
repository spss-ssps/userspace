// COSMIC UNIVERSE - 3D Star Visualization
// User adds stars with zodiac signs → saved to server → displayed in 3D space
// Click stars to view details, orbit camera to explore

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber'; // 3D scene wrapper
import { OrbitControls } from '@react-three/drei'; // Camera controls
import Scene from './Scene';
import './App.css';

// All 12 zodiac signs for dropdown menus
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export default function CosmicUniverse() {
  // UI state
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedStar, setSelectedStar] = useState(null);

  // Form inputs
  const [sunSign, setSunSign] = useState('');
  const [moonSign, setMoonSign] = useState('');
  const [risingSign, setRisingSign] = useState('');

  // Star data
  const [stars, setStars] = useState([]);
  const [starCount, setStarCount] = useState(0);
  const [userStarId, setUserStarId] = useState(null); // Track user's star ID
  const [highlightUserStar, setHighlightUserStar] = useState(false); // Highlight on hover

  const SERVER_URL = import.meta.env.PROD
    ? 'https://your-api-url.onrender.com' // Replace with your Render URL
    : 'http://localhost:4000'; // Local development

  // Save star to server
  const postStarToServer = async (star) => {
    const res = await fetch(`${SERVER_URL}/api/stars`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(star),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return res.json();
  };

  // Load all stars from server
  const fetchStarsFromServer = async () => {
    const res = await fetch(`${SERVER_URL}/api/stars`);
    if (!res.ok) throw new Error('Failed to fetch stars from server');
    return res.json();
  };

  // Load stars when app starts
  useEffect(() => {
    // Check if user already has a star
    const savedStarId = localStorage.getItem('userStarId');
    if (savedStarId) {
      setUserStarId(savedStarId);
    }

    (async () => {
      try {
        const serverStars = await fetchStarsFromServer();
        setStars(serverStars);
        setStarCount(serverStars.length);
      } catch (err) {
        console.warn('Could not load stars from server:', err);
        setStarCount(0);
      }
    })();
  }, []);

  // Handle form submission (add or edit)
  const handleSubmit = async () => {
    if (!sunSign || !moonSign || !risingSign) {
      alert('Please fill in all zodiac signs');
      return;
    }

    setLoading(true);

    const starData = {
      sunSign,
      moonSign,
      risingSign,
      position: { // Random position in 3D space (reuse existing if editing)
        x: (Math.random() - 0.5) * 80,
        y: (Math.random() - 0.5) * 80,
        z: (Math.random() - 0.5) * 80
      },
      timestamp: Date.now()
    };

    try {
      if (userStarId) {
        // Edit mode: update existing star
        const res = await fetch(`${SERVER_URL}/api/stars/${userStarId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(starData),
        });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const updated = await res.json();
        setStars(prev => prev.map(s => s.id === userStarId ? updated : s));
      } else {
        // Add mode: create new star
        const saved = await postStarToServer(starData);
        setStars(prev => [...prev, saved]);
        setStarCount(prev => prev + 1);
        // Save star ID to localStorage
        localStorage.setItem('userStarId', saved.id);
        setUserStarId(saved.id);
      }
    } catch (err) {
      alert('Could not save star to server. Make sure the server is running.');
    }

    // Reset form
    setSunSign('');
    setMoonSign('');
    setRisingSign('');
    setShowForm(false);
    setLoading(false);
  };

  // Show star details popup when clicked
  const handleStarClick = (starData) => {
    setSelectedStar(starData);
  };
  return (
    <div className="app-container">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 100], fov: 60 }}
        style={{ touchAction: 'none' }}
      >
        <color attach="background" args={['#000200']} />
        <ambientLight intensity={0.5} color="#404040" />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={10}
          maxDistance={200}
        />
        <Scene
          stars={stars}
          onStarClick={handleStarClick}
          userStarId={userStarId}
          highlightUserStar={highlightUserStar}
        />
      </Canvas>

      {/* UI Layer */}
      <div className="ui-overlay">
        {/* Star counter */}
        <div className="star-counter">
          <div className="star-counter-label">Stars in Universe</div>
          <div className="star-counter-value">{starCount}</div>
        </div>

        {/* Star details popup */}
        {selectedStar && (
          <div className="star-details">
            <button
              className="star-details-close"
              onClick={() => setSelectedStar(null)}
            >
              ×
            </button>
            <h3 className="star-details-title">Star Details</h3>
            <div className="star-details-content">
              <div className="star-detail-item">
                <span className="star-detail-label">☉ Sun Sign:</span>
                <span className="star-detail-value">{selectedStar.sunSign}</span>
              </div>
              <div className="star-detail-item">
                <span className="star-detail-label">☽ Moon Sign:</span>
                <span className="star-detail-value">{selectedStar.moonSign}</span>
              </div>
              <div className="star-detail-item">
                <span className="star-detail-label">↑ Rising Sign:</span>
                <span className="star-detail-value">{selectedStar.risingSign}</span>
              </div>
              <div className="star-detail-item">
                <span className="star-detail-label">📅 Added:</span>
                <span className="star-detail-value">
                  {new Date(selectedStar.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit button */}
        {!showForm && (
          <button
            onClick={() => {
              // Pre-fill form if editing
              if (userStarId) {
                const userStar = stars.find(s => s.id === userStarId);
                if (userStar) {
                  setSunSign(userStar.sunSign);
                  setMoonSign(userStar.moonSign);
                  setRisingSign(userStar.risingSign);
                }
              }
              setShowForm(true);
            }}
            onMouseEnter={() => userStarId && setHighlightUserStar(true)}
            onMouseLeave={() => setHighlightUserStar(false)}
            className="add-star-button"
          >
            {userStarId ? 'Edit Your Star' : 'Add Your Star'}
          </button>
        )}

        {/* Form modal */}
        {showForm && (
          <div className="form-overlay">
            <div className="form-container">
              <div className="form-header">
                <h2 className="form-title">{userStarId ? 'Edit Your Star' : 'Add Your Star'}</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="close-button"
                >
                  ×
                </button>
              </div>

              <div className="form-content">
                <div className="form-group">
                  <label className="form-label">
                    ☉ Sun Sign
                  </label>
                  <select
                    value={sunSign}
                    onChange={(e) => setSunSign(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select...</option>
                    {ZODIAC_SIGNS.map(sign => (
                      <option key={sign} value={sign}>{sign}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    ☽ Moon Sign
                  </label>
                  <select
                    value={moonSign}
                    onChange={(e) => setMoonSign(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select...</option>
                    {ZODIAC_SIGNS.map(sign => (
                      <option key={sign} value={sign}>{sign}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    ↑ Rising Sign
                  </label>
                  <select
                    value={risingSign}
                    onChange={(e) => setRisingSign(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select...</option>
                    {ZODIAC_SIGNS.map(sign => (
                      <option key={sign} value={sign}>{sign}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="submit-button"
                >
                  {loading ? (userStarId ? 'Updating...' : 'Adding Star...') : (userStarId ? 'Update' : 'Add')}
                </button>
              </div>

              {/* <p className="form-footer">
                Your star will be visible to everyone exploring the cosmic universe
              </p> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 