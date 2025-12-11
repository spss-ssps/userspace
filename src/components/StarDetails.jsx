// StarDetails component:popup that shows info about a clicked star
// Displays the Sun, Moon, and Rising signs plus when it was added

import React from 'react';

export default function StarDetails({ star, onClose }) {
    // If no star is selected, don't show anything
    if (!star) return null;

    return (
        <div className="star-details">
            {/* Close button (X) */}
            <button className="star-details-close" onClick={onClose}>
                ×
            </button>

            {/* Title */}
            <h3 className="star-details-title">Star Details</h3>

            {/* Star information */}
            <div className="star-details-content">
                {/* Sun Sign */}
                <div className="star-detail-item">
                    <span className="star-detail-label">☉ Sun Sign:</span>
                    <span className="star-detail-value">{star.sunSign}</span>
                </div>

                {/* Moon Sign */}
                <div className="star-detail-item">
                    <span className="star-detail-label">☽ Moon Sign:</span>
                    <span className="star-detail-value">{star.moonSign}</span>
                </div>

                {/* Rising Sign */}
                <div className="star-detail-item">
                    <span className="star-detail-label">↑ Rising Sign:</span>
                    <span className="star-detail-value">{star.risingSign}</span>
                </div>

                {/* Date Added */}
                <div className="star-detail-item">
                    <span className="star-detail-label">📅 Added:</span>
                    <span className="star-detail-value">
                        {new Date(star.timestamp).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    );
}
