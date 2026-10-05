import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Attach Authorization Bearer token to all requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('civic_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clean invalid token
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        // localStorage.removeItem('civic_token');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

// Grievance Endpoints
export const grievanceService = {
  // Create grievance with multipart/form-data (photo + lat/lng + title + category + description)
  createGrievance: async (formData) => {
    const res = await api.post('/grievances', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Map bounding box query: swLat, swLng, neLat, neLng, status, category
  getMapView: async (params = {}) => {
    const res = await api.get('/grievances/map-view', { params });
    return res.data;
  },

  // Worker status update
  updateStatus: async (id, status) => {
    const res = await api.patch(`/grievances/${id}/status`, { status });
    return res.data;
  },

  // Get current user's submitted grievances
  getMyGrievances: async () => {
    const res = await api.get('/grievances/my');
    return res.data;
  },

  // Get dashboard metrics
  getStats: async () => {
    const res = await api.get('/grievances/stats');
    return res.data;
  },

  // Get grievance by ID
  getById: async (id) => {
    const res = await api.get(`/grievances/${id}`);
    return res.data;
  }
};

// Helper for photo absolute URLs
export const getPhotoUrl = (photoPath) => {
  if (!photoPath) return '/placeholder-issue.png';
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  // Ensure leading slash
  const cleanPath = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
  return `${API_BASE_URL}${cleanPath}`;
};

export default api;
