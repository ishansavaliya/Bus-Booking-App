import axios from 'axios';
import {getAccessToken, getRefreshToken, setAccessToken} from './storage';
import {BASE_URL} from './config';

// Force the base URL to be explicit and consistent
const API_URL = BASE_URL;
console.log('API Base URL (forced):', API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Adding a timeout for better error handling
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

//Request Interceptor
apiClient.interceptors.request.use(
  async config => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
    return config;
  },
  error => Promise.reject(error),
);

//Response Interceptor
apiClient.interceptors.response.use(
  response => {
    console.log(`Response from ${response.config.url}: Status ${response.status}`);
    return response;
  },
  async error => {
    console.error(`Error response from ${error.config?.url}: `, error.response?.status || error.message);
    
    if (error.response?.status === 403) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        console.log('Attempting token refresh...');
        const {data} = await axios.post(`${API_URL}/user/refresh`, {
          refreshToken,
        });
        setAccessToken(data?.accessToken);
        error.config.headers.Authorization = `Bearer ${data?.accessToken}`;
        return axios(error.config);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
