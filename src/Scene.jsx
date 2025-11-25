import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber'; // Runs every frame for animation
import * as THREE from 'three';

// Zodiac element colors
const ELEMENT_COLORS = {
    fire: 0xff6b35,    // Orange-red
    earth: 0x6b8e23,   // Olive green
    air: 0xf4e04d,     // Yellow
    water: 0x4a90e2    // Blue
};

// Map signs to elements
const SIGN_TO_ELEMENT = {
    'Aries': 'fire', 'Leo': 'fire', 'Sagittarius': 'fire',
    'Taurus': 'earth', 'Virgo': 'earth', 'Capricorn': 'earth',
    'Gemini': 'air', 'Libra': 'air', 'Aquarius': 'air',
    'Cancer': 'water', 'Scorpio': 'water', 'Pisces': 'water'
};

// Individual star component with triple gradient (Sun → Moon → Rising)
function Star({ starData, onClick, index, isUserStar, highlight }) {
    const meshRef = useRef();

    // Get colors for each zodiac sign
    const sunColor = new THREE.Color(ELEMENT_COLORS[SIGN_TO_ELEMENT[starData.sunSign]]);
    const moonColor = new THREE.Color(ELEMENT_COLORS[SIGN_TO_ELEMENT[starData.moonSign]]);
    const risingColor = new THREE.Color(ELEMENT_COLORS[SIGN_TO_ELEMENT[starData.risingSign]]);

    // Animate: gentle pulsing effect (enhanced if highlighted)
    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.getElapsedTime();
            // Enhanced pulse for user's star when highlighted
            const pulseAmount = (isUserStar && highlight) ? 0.15 : 0.05;
            const pulseSpeed = (isUserStar && highlight) ? 3 : 1;
            meshRef.current.scale.setScalar(1 + Math.sin(time * pulseSpeed + index) * pulseAmount);
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={[starData.position.x, starData.position.y, starData.position.z]}
            onClick={(e) => {
                e.stopPropagation();
                onClick(starData);
            }}
        >
            {/* Core: Sun sign color */}
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial color={sunColor} />

            {/* Middle glow: Moon sign color */}
            <mesh>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshBasicMaterial
                    color={moonColor}
                    transparent
                    opacity={(isUserStar && highlight) ? 0.6 : 0.4}
                />
            </mesh>

            {/* Outer ring: Rising sign color */}
            <mesh>
                <sphereGeometry args={[2, 32, 32]} />
                <meshBasicMaterial
                    color={risingColor}
                    transparent
                    opacity={(isUserStar && highlight) ? 0.4 : 0.2}
                />
            </mesh>
        </mesh>
    );
}

// Scene: renders all stars
export default function Scene({ stars, onStarClick, userStarId, highlightUserStar }) {
    return (
        <>
            {stars.map((star, i) => (
                <Star
                    key={star.id || i}
                    starData={star}
                    onClick={onStarClick}
                    index={i}
                    isUserStar={star.id === userStarId}
                    highlight={highlightUserStar}
                />
            ))}
        </>
    );
}