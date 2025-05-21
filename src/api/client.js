// api/client.js

const BASE_URL = 'https://api.openf1.org/v1';

export const fetchData = async (endpoint, params = {}) => {
  try {
    // Build the URL
    let url = `${BASE_URL}/${endpoint}`;

    // Add query parameters if provided
    if (Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else {
          queryParams.append(key, value);
        }
      });
      url += `?${queryParams.toString()}`;
    }

    console.log(`Fetching data from: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

// For backwards compatibility
export const DataSources = {
  API: 'api'
};