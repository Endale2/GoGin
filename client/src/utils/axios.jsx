import axios from 'axios';

const apiBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: apiBase,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        
        await axiosInstance.post('/auth/refresh-token', {}, { withCredentials: true });
        
        return axiosInstance(error.config);
      } catch (refreshError) {
        
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
