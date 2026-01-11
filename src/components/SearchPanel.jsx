import { useState } from 'react';
import { Search as SearchIcon, MapPin, Filter } from 'lucide-react';
import { searchBusinesses } from '../services/apiService';
import SearchableSelect from './SearchableSelect';
import { CATEGORIES } from '../utils/categories';
import './SearchPanel.css';

export default function SearchPanel({ onSearchResults, onLoading }) {
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('restaurant');
  const [radius, setRadius] = useState(10);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!city.trim()) {
      return;
    }

    setSearching(true);
    onLoading(true);

    try {
      // Convert miles to meters
      const radiusMeters = Math.round(radius * 1609.34);
      const results = await searchBusinesses(city, category, radiusMeters);
      
      // Map results with temporary IDs (not saved to database yet)
      const resultsWithIds = results.map((business, index) => ({
        ...business,
        id: business.osm_identifier || `search-${Date.now()}-${index}`,
        category,
        city,
        searchRadius: radius,
        source: 'osm',
        isSaved: false // Mark as unsaved
      }));
      
      onSearchResults(resultsWithIds);
    } catch (error) {
      console.error('Search error:', error);
      onSearchResults([]);
    } finally {
      setSearching(false);
      onLoading(false);
    }
  };

  return (
    <div className="search-panel">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-form-grid">
          <div className="form-group">
            <label htmlFor="city">
              <MapPin size={18} />
              City & State
            </label>
            <input
              type="text"
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., New York, NY"
              required
              disabled={searching}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">
              <Filter size={18} />
              Business Category
            </label>
            <SearchableSelect
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={searching}
              options={Object.entries(CATEGORIES)
                .map(([key, label]) => ({
                  value: key,
                  label: label
                }))
                .sort((a, b) => a.label.localeCompare(b.label))}
              placeholder="Select category..."
            />
          </div>

          <div className="form-group radius-group">
            <label htmlFor="radius">
              Search Radius: {radius} {radius === 1 ? 'mile' : 'miles'}
            </label>
            <div className="radius-slider">
              <input
                type="range"
                id="radius"
                min="1"
                max="100"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                disabled={searching}
              />
              <span className="radius-value">{radius} mi</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary search-btn"
          disabled={searching}
        >
          {searching ? (
            <>
              <div className="spinner-small"></div>
              <span>Searching...</span>
            </>
          ) : (
            <>
              <SearchIcon size={20} />
              <span>Search Businesses</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

