export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:6001';

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${API_URL}/${cleanEndpoint}`;
}; 