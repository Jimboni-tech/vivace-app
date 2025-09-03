
import AsyncStorage from '@react-native-async-storage/async-storage';
// ...existing code...


// Get the API URL from environment variables (fallback to localhost API for dev)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

if (!process.env.EXPO_PUBLIC_API_URL) {
  console.warn('EXPO_PUBLIC_API_URL not set; defaulting API_URL to http://localhost:3000/api');
}

// Helper function to get auth token
const getAuthToken = async () => {
  try {
    // Try both token keys to ensure backward compatibility
    const token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem('token');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Generic API request function with auth
const apiRequest = async (endpoint, method = 'GET', body = null) => {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    const options = {
      method,
      headers
    };
    
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, options);
      const url = `${API_URL}${endpoint}`;
    
      // Handle non-2xx responses
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} ${response.statusText} - ${url} - ${errorText}`);
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
    
    // For 204 No Content responses
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Request Error (${endpoint}):`, error);
    throw error;
  }
};

// Session specific API calls
const sessionApi = {
  // Create a new practice session
  createSession: (sessionData) => {
    return apiRequest('/practice', 'POST', sessionData);
  },
  
  // Get a specific session by ID
  getSession: (sessionId) => {
    return apiRequest(`/practice/${sessionId}`);
  },
  
  // Update a session
  updateSession: (sessionId, sessionData) => {
    return apiRequest(`/practice/${sessionId}`, 'PUT', sessionData);
  },
  
  // Complete a session
  completeSession: (sessionId, completionData) => {
    return apiRequest(`/practice/${sessionId}/complete`, 'PATCH', completionData);
  },
  
  // Delete a session
  deleteSession: (sessionId) => {
    return apiRequest(`/practice/${sessionId}`, 'DELETE');
  },
  
  // Add a piece/exercise to a session
  addPiece: (sessionId, pieceData) => {
    return apiRequest(`/practice/${sessionId}/pieces`, 'POST', pieceData);
  },
  
  // Delete a piece/exercise from a session
  deletePiece: (sessionId, pieceId) => {
    return apiRequest(`/practice/${sessionId}/pieces/${pieceId}`, 'DELETE');
  },
  
  // Get user's practice sessions
  getUserSessions: (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    const endpoint = `/practice${queryString ? `?${queryString}` : ''}`;
    return apiRequest(endpoint);
  },
  // Get all stats for the stats page
  getStats: () => {
    return apiRequest('/practice/stats');
  }
};

// User specific API calls
const userApi = {
  // Get current user profile
  getCurrentUser: () => {
    return apiRequest('/user/me');
  },
  
  // Update user profile
  updateProfile: (userData) => {
    return apiRequest('/user/profile', 'PUT', userData);
  },
  
  // Get user stats
  getUserStats: () => {
    return apiRequest('/user/stats');
  },
  // Get practiced items
  getPracticed: () => apiRequest('/users/practiced'),
  getPracticedSongs: () => apiRequest('/users/practiced/songs'),
  getPracticedExercises: () => apiRequest('/users/practiced/exercises')
};

export {
  sessionApi,
  userApi
};

export const API_BASE_URL = API_URL;
