/**
 * Utility to handle URLs and asset paths consistently across the application.
 */

// Get the root server URL (without /api suffix)
export const getServerURL = () => {
    // Priority to env var, fallback to localhost
    const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    // If user provided a URL with /api at the end, strip it to get the server root
    return rawUrl.replace(/\/api\/?$/, '');
};

// Get base URL for the API (always includes /api suffix)
export const getApiBaseURL = () => {
    const serverUrl = getServerURL();
    return `${serverUrl}/api`;
};

/**
 * Construct a full URL for an uploaded file or asset.
 * @param {string} path - The relative path to the asset (e.g., '/uploads/avatar.png')
 * @returns {string|null} - The full URL or null if path is empty
 */
export const getFullAssetURL = (path) => {
    if (!path) return null;

    // If it's already a full URL, return it
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    const serverUrl = getServerURL();

    // Ensure the path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${serverUrl}${normalizedPath}`;
};
