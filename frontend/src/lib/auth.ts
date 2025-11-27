// Helper function to make authenticated API requests
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');

    const headers = {
        ...options.headers,
        ...(token ? { 'Authorization': `Token ${token}` } : {}),
    };

    return fetch(url, {
        ...options,
        headers,
    });
};

// Helper to check if user is authenticated
export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('token');
};

// Helper to get token
export const getToken = (): string | null => {
    return localStorage.getItem('token');
};
