// API utilities for talking to the server
// All fetch calls are here in one place - easy to find and modify

// Figure out the server URL based on environment
// In development: use localhost:4001
// In production: use same origin (empty string means current domain)
const SERVER_URL = import.meta.env.DEV ? 'http://localhost:4001' : '';

// GET all stars from the server
export async function getAllStars() {
    const response = await fetch(`${SERVER_URL}/api/stars`);
    if (!response.ok) {
        throw new Error('Failed to fetch stars from server');
    }
    return response.json();
}

// POST a new star to the server
export async function createStar(starData) {
    const response = await fetch(`${SERVER_URL}/api/stars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(starData),
    });
    if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
    }
    return response.json();
}

// PUT (update) an existing star by ID
export async function updateStar(starId, starData) {
    const response = await fetch(`${SERVER_URL}/api/stars/${starId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(starData),
    });
    if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
    }
    return response.json();
}
