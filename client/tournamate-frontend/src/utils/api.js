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
    // This header ('x-auth-token') must match what your
    // backend middleware (middleware/auth.js) expects
    options.headers['x-auth-token'] = token;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.msg || 'An API error occurred');
  }

  return data;
};

// You can also create specific helper functions
export const apiGet = (endpoint) => api(endpoint, 'GET');
export const apiPost = (endpoint, body) => api(endpoint, 'POST', body);
export const apiPut = (endpoint, body) => api(endpoint, 'PUT', body);
export const apiDelete = (endpoint) => api(endpoint, 'DELETE');