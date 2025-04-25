import apiClient from '../apiClient';

export const fetchBuses = async (from: string, to: string, date: string) => {
  const {data} = await apiClient.post('/bus/search', {from, to, date});
  return data?.data || [];
};

export const fetchBusDetails = async (busId: string) => {
  const {data} = await apiClient.get(`/bus/${busId}`);
  return data?.data || {}; // Return an object instead of an array
};

export const fetchUserTickets = async () => {
  const {data} = await apiClient.get('/ticket/my-tickets');
  return data.tickets;
};

export const bookTicket = async ({
  busId,
  date,
  seatNumbers,
}: {
  busId: string;
  date: string;
  seatNumbers: number[];
}) => {
  try {
    console.log('-----------------------------------');
    console.log('BOOKING TICKET - Request details:');
    console.log('API URL:', apiClient.defaults.baseURL);
    console.log('Endpoint: /ticket/book');
    console.log('Payload:', {busId, date, seatNumbers});
    console.log('-----------------------------------');
    
    // Make the API call
    const response = await apiClient.post('/ticket/book', {
      busId,
      date, 
      seatNumbers
    });
    
    console.log('Booking successful!', response.data);
    return response.data?.ticket;
  } catch (error: any) {
    console.error('Booking failed with error:', error);
    
    // Detailed error logging
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      console.error('Server response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    }
    
    // Try with a direct axios call as a fallback to check for connection issues
    try {
      console.log('Attempting direct fallback request to verify server connection...');
      const testResponse = await fetch(`${apiClient.defaults.baseURL}/test`);
      console.log('Server test response:', testResponse.ok ? 'OK' : 'Failed');
    } catch (testError) {
      console.error('Server connection test failed:', testError);
    }
    
    throw error;
  }
};
