const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://business-scraper-server.onrender.com/api';

export const searchBusinesses = async (city, category, radius) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/search?city=${encodeURIComponent(city)}&category=${category}&radius=${radius}`
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data;
  } catch (error) {
    console.error('API search error:', error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

