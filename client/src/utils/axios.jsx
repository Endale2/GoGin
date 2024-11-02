import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,  // Enables sending cookies with requests
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        // Attempt to refresh the token
        await axiosInstance.post('/auth/refresh-token', {}, { withCredentials: true });
        // Retry the original request after refreshing
        return axiosInstance(error.config);
      } catch (refreshError) {
        // If refreshing fails, redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
