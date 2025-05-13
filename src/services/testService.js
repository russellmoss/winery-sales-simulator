import { v4 as uuidv4 } from 'uuid';
import { API_BASE_URL } from '../config/api';

export const testCors = async () => {
  try {
    const userId = uuidv4();
    console.log('Testing CORS with user ID:', userId);

    const response = await fetch(`${API_BASE_URL}/test-cors`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-user-id': userId,
        'x-request-id': uuidv4(),
        'x-requested-with': 'XMLHttpRequest'
      },
      credentials: 'include',
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('CORS test response:', data);
    return data;
  } catch (error) {
    console.error('CORS test failed:', error);
    throw error;
  }
}; 