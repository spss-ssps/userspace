// StarForm component - handles adding/editing a star
// This form lets users input their Sun, Moon, and Rising signs

import React from 'react';

// All 12 zodiac signs for the dropdown menus
const ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export default function StarForm({
    isEditing,      // true if editing existing star, false if creating new
    sunSign,        // Current sun sign value
    moonSign,       // Current moon sign value
    risingSign,     // Current rising sign value
    onSunChange,    // Function to call when sun sign changes
    onMoonChange,   // Function to call when moon sign changes
    onRisingChange, // Function to call when rising sign changes
    onSubmit,       // Function to call when form is submitted
    onClose,        // Function to call when user closes the form
    loading         // true if currently saving, false otherwise
}) {
    return (
        <div className="form-overlay">
            <div className="form-container">
                {/* Header with title and close button */}
                <div className="form-header">
                    <h2 className="form-title">
                        {isEditing ? 'Edit Your Star' : 'Add Your Star'}
                    </h2>
                    <button onClick={onClose} className="close-button">
                        ×
                    </button>
                </div>

                {/* Form fields */}
                <div className="form-content">
                    {/* Sun Sign dropdown */}
                    <div className="form-group">
                        <label className="form-label">☉ Sun Sign</label>
                        <select
                            value={sunSign}
                            onChange={(e) => onSunChange(e.target.value)}
                            className="form-select"
                        >
                            <option value="">Select...</option>
                            {ZODIAC_SIGNS.map(sign => (
                                <option key={sign} value={sign}>{sign}</option>
                            ))}
                        </select>
                    </div>

                    {/* Moon Sign dropdown */}
                    <div className="form-group">
                        <label className="form-label">☽ Moon Sign</label>
                        <select
                            value={moonSign}
                            onChange={(e) => onMoonChange(e.target.value)}
                            className="form-select"
                        >
                            <option value="">Select...</option>
                            {ZODIAC_SIGNS.map(sign => (
                                <option key={sign} value={sign}>{sign}</option>
                            ))}
                        </select>
                    </div>

                    {/* Rising Sign dropdown */}
                    <div className="form-group">
                        <label className="form-label">↑ Rising Sign</label>
                        <select
                            value={risingSign}
                            onChange={(e) => onRisingChange(e.target.value)}
                            className="form-select"
                        >
                            <option value="">Select...</option>
                            {ZODIAC_SIGNS.map(sign => (
                                <option key={sign} value={sign}>{sign}</option>
                            ))}
                        </select>
                    </div>

                    {/* Submit button */}
                    <button
                        onClick={onSubmit}
                        disabled={loading}
                        className="submit-button"
                    >
                        {loading
                            ? (isEditing ? 'Updating...' : 'Adding Star...')
                            : (isEditing ? 'Update' : 'Add')
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
