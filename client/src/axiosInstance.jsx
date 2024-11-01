// src/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',  // Replace with your server URL if needed
  withCredentials: true,  // Allow cookies to be sent with requests
});

export default axiosInstance;
