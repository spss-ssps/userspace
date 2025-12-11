// COSMIC UNIVERSE - 3D Star Visualization
// User adds stars with zodiac signs → saved to server → displayed in 3D space
// Click stars to view details, orbit camera to explore

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Scene from './Scene';
import StarForm from './components/StarForm';
import StarDetails from './components/StarDetails';
import { getAllStars, createStar, updateStar } from './utils/api';
import './App.css';

export default function CosmicUniverse() {
  // === STATE ===
  // UI state: what's showing on screen
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedStar, setSelectedStar] = useState(null);
  const [highlightUserStar, setHighlightUserStar] = useState(false);

  // Form values: what the user is typing
  const [sunSign, setSunSign] = useState('');
  const [moonSign, setMoonSign] = useState('');
  const [risingSign, setRisingSign] = useState('');

  // Star data: all the stars and user's star
  const [stars, setStars] = useState([]);
  const [userStarId, setUserStarId] = useState(null);

  // === LOAD STARS ON START ===
  // When the app first loads, get all stars from the server
  useEffect(() => {
    // Check if this user already added a star before
    const savedStarId = localStorage.getItem('userStarId');
    if (savedStarId) {
      setUserStarId(savedStarId);
    }

    // Load all stars from server
    (async () => {
      try {
        const allStars = await getAllStars();
        setStars(allStars);
      } catch (err) {
        console.warn('Could not load stars:', err);
      }
    })();
  }, []);

  // === SUBMIT FORM ===
  // When user clicks "Add" or "Update" button
  const handleSubmit = async () => {
    // Make sure all fields are filled
    if (!sunSign || !moonSign || !risingSign) {
      alert('Please fill in all zodiac signs');
      return;
    }

    setLoading(true);

    // Create the star data object
    const starData = {
      sunSign,
      moonSign,
      risingSign,
      position: {
        x: (Math.random() - 0.5) * 80,
        y: (Math.random() - 0.5) * 80,
        z: (Math.random() - 0.5) * 80
      },
      timestamp: Date.now()
    };

    try {
      if (userStarId) {
        // EDITING: Update the existing star
        const updated = await updateStar(userStarId, starData);
        setStars(prev => prev.map(s => s.id === userStarId ? updated : s));
      } else {
        // ADDING: Create a new star
        const saved = await createStar(starData);
        setStars(prev => [...prev, saved]);
        // Remember this star ID for later
        localStorage.setItem('userStarId', saved.id);
        setUserStarId(saved.id);
      }
    } catch (err) {
      alert('Could not save star. Make sure the server is running.');
    }

    // Close form and reset
    setSunSign('');
    setMoonSign('');
    setRisingSign('');
    setShowForm(false);
    setLoading(false);
  };

  // === OPEN FORM ===
  // When user clicks "Add Your Star" or "Edit Your Star"
  const handleOpenForm = () => {
    // If editing, pre-fill the form with existing values
    if (userStarId) {
      const userStar = stars.find(s => s.id === userStarId);
      if (userStar) {
        setSunSign(userStar.sunSign);
        setMoonSign(userStar.moonSign);
        setRisingSign(userStar.risingSign);
      }
    }
    setShowForm(true);
  };

  // === RENDER ===
  return (
    <div className="app-container">
      {/* === 3D CANVAS === */}
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
          onStarClick={setSelectedStar}
          userStarId={userStarId}
          highlightUserStar={highlightUserStar}
        />
      </Canvas>

      {/* === UI OVERLAY === */}
      <div className="ui-overlay">
        {/* Star counter */}
        <div className="star-counter">
          <div className="star-counter-label">Stars in Universe</div>
          <div className="star-counter-value">{stars.length}</div>
        </div>

        {/* Star details popup (when you click a star) */}
        <StarDetails
          star={selectedStar}
          onClose={() => setSelectedStar(null)}
        />

        {/* Add/Edit button */}
        {!showForm && (
          <button
            onClick={handleOpenForm}
            onMouseEnter={() => userStarId && setHighlightUserStar(true)}
            onMouseLeave={() => setHighlightUserStar(false)}
            className="add-star-button"
          >
            {userStarId ? 'Edit Your Star' : 'Add Your Star'}
          </button>
        )}

        {/* Form modal (for adding/editing star) */}
        {showForm && (
          <StarForm
            isEditing={!!userStarId}
            sunSign={sunSign}
            moonSign={moonSign}
            risingSign={risingSign}
            onSunChange={setSunSign}
            onMoonChange={setMoonSign}
            onRisingChange={setRisingSign}
            onSubmit={handleSubmit}
            onClose={() => setShowForm(false)}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
} 