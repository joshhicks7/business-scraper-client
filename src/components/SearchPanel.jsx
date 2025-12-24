import { useState } from 'react';
import { Search as SearchIcon, MapPin, Filter } from 'lucide-react';
import { searchBusinesses } from '../services/apiService';
import { addBusiness } from '../services/firebaseService';
import './SearchPanel.css';

const CATEGORIES = {
  landscaping: '🏡 Landscaping',
  plumber: '🔧 Plumber',
  electrician: '⚡ Electrician',
  hvac: '❄️ HVAC',
  carpenter: '🪚 Carpenter',
  painter: '🎨 Painter',
  roofer: '🏠 Roofer',
  locksmith: '🔐 Locksmith',
  handyman: '🔨 Handyman',
  restaurant: '🍽️ Restaurant',
  cafe: '☕ Cafe',
  fast_food: '🍔 Fast Food',
  bar: '🍺 Bar',
  pub: '🍻 Pub',
  bakery: '🥐 Bakery',
  pizza: '🍕 Pizza',
  dentist: '🦷 Dentist',
  doctor: '👨‍⚕️ Doctor',
  pharmacy: '💊 Pharmacy',
  hospital: '🏥 Hospital',
  veterinary: '🐾 Veterinary',
  optometrist: '👓 Optometrist',
  auto_repair: '🚗 Auto Repair',
  car_dealer: '🚙 Car Dealer',
  gas_station: '⛽ Gas Station',
  car_wash: '🧼 Car Wash',
  auto_parts: '🔩 Auto Parts',
  barber: '💇 Barber',
  nail_salon: '💅 Nail Salon',
  spa: '🧖 Spa',
  tattoo: '🎨 Tattoo Studio',
  gym: '💪 Gym / Fitness Center',
  yoga: '🧘 Yoga Studio',
  golf_course: '⛳ Golf Course',
  lawyer: '⚖️ Lawyer',
  accountant: '📊 Accountant',
  real_estate: '🏘️ Real Estate',
  insurance: '🛡️ Insurance',
  financial_advisor: '💰 Financial Advisor',
  grocery: '🛒 Grocery Store',
  convenience: '🏪 Convenience Store',
  clothing: '👕 Clothing Store',
  hardware: '🔨 Hardware Store',
  furniture: '🪑 Furniture Store',
  electronics: '📱 Electronics Store',
  bookstore: '📚 Bookstore',
  school: '🏫 School',
  university: '🎓 University',
  driving_school: '🚗 Driving School',
  language_school: '🌍 Language School',
  hotel: '🏨 Hotel',
  motel: '🛣️ Motel',
  bed_breakfast: '🛏️ Bed & Breakfast',
  movie_theater: '🎬 Movie Theater',
  theater: '🎭 Theater',
  museum: '🏛️ Museum',
  zoo: '🦁 Zoo',
  park: '🌳 Park',
  bank: '🏦 Bank',
  atm: '💳 ATM',
  post_office: '📮 Post Office',
  dry_cleaner: '👔 Dry Cleaner',
  laundromat: '🧺 Laundromat',
  storage: '📦 Storage Facility',
  pet_store: '🐕 Pet Store',
  florist: '🌹 Florist',
  jewelry: '💍 Jewelry Store',
  gift_shop: '🎁 Gift Shop',
  pawn_shop: '💎 Pawn Shop'
};

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
      
      // Save results to Firebase (with duplicate checking)
      const savePromises = results.map(business => 
        addBusiness({
          ...business,
          category,
          city,
          searchRadius: radius
        }).catch(err => {
          console.error('Error saving business to Firebase:', err);
          return null;
        })
      );
      
      const savedIds = await Promise.all(savePromises);
      
      // Map results with Firebase IDs (or existing IDs if duplicate)
      const resultsWithIds = results.map((business, index) => ({
        ...business,
        id: savedIds[index] || business.osm_identifier || `search-${Date.now()}-${index}`
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
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={searching}
            >
              {Object.entries(CATEGORIES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
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

