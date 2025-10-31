import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  withCredentials: true, // This is crucial for sending cookies (like session tokens) with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Define your API functions here ---

/**
 * Fetches the main data for the user's dashboard.
 */
export const getDashboardData = async () => {
  try {
    const response = await apiClient.get('/api/dashboard/');
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // You can handle errors here, e.g., by redirecting to login if it's a 401 Unauthorized error
    throw error;
  }
};

/**
 * Fetches the current user's profile information.
 */
export const getProfileData = async () => {
  try {
    const response = await apiClient.get('/api/profile/');
    return response.data;
  } catch (error) {
    console.error("Error fetching profile data:", error);
    throw error;
  }
};

// Add more functions for your other endpoints as you build them:
// export const getCommunityData = async () => { ... };
// export const postQuotationRequest = async (data) => { ... };

export default apiClient;
