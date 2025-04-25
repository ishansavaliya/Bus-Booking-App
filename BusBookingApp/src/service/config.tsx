import {Platform} from 'react-native';

// Fix potential typo in the commented out URL and make the configuration more robust
export const BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

// Uncommenting and fixing the typo in case you want to use your network IP
// export const BASE_URL = 'http://192.168.29.144:4000';

// This will help confirm the configured URL in the logs
console.log('Environment:', Platform.OS);
console.log('Configured API URL:', BASE_URL);
