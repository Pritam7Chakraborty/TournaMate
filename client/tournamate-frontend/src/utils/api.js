// src/utils/api.js

const BASE_URL = 'http://localhost:3000/api';

/**
 * A centralized fetch wrapper for our API
 * @param {string} endpoint The API endpoint (e.g., '/tournaments')
 * @param {string} [method='GET'] The HTTP method
 * @param {object} [body=null] The request body for POST/PUT
 * @returns {Promise<any>} The JSON response
 */
export const api = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['x-auth-token'] = token;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  // 1. Read the response as text first. This is safe and only reads the stream once.
  const responseText = await response.text();

  // 2. Check if the request was successful
  if (response.ok) {
    // If there's no text, it was a 204 (No Content) or just an empty success
    if (!responseText) {
      return null;
    }
    
    // Try to parse the successful text response as JSON
    try {
      return JSON.parse(responseText);
    } catch  {
      // It was a 200 OK, but not JSON? Return the text.
      return responseText;
    }
  }

  // --- If we are here, the request FAILED (4xx or 5xx) ---

  // 3. Try to parse the error text as JSON
  try {
    const errorData = JSON.parse(responseText);
    // If successful, throw the JSON error message
    throw new Error(errorData.msg || 'An API error occurred');
  } catch  {
    // If it failed, the error was plain text. Just throw the text.
    throw new Error(responseText || `HTTP error! Status: ${response.status}`);
  }
};

// Helper functions (these are unchanged and will use the new logic)
export const apiGet = (endpoint) => api(endpoint, 'GET');
export const apiPost = (endpoint, body) => api(endpoint, 'POST', body);
export const apiPut = (endpoint, body) => api(endpoint, 'PUT', body);
export const apiDelete = (endpoint) => api(endpoint, 'DELETE');