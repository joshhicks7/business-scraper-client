import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { addBusiness } from '../services/firebaseService';
import './CreateBusinessModal.css';

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

export default function CreateBusinessModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'restaurant',
    address: '',
    phone: '',
    email: '',
    website: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: '',
    longitude: '',
    opening_hours: ''
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Business name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    if (formData.latitude && (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90)) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    if (formData.longitude && (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180)) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      // Build address string
      const addressParts = [];
      if (formData.address) addressParts.push(formData.address);
      if (formData.city) addressParts.push(formData.city);
      if (formData.state) addressParts.push(formData.state);
      if (formData.zipCode) addressParts.push(formData.zipCode);
      const fullAddress = addressParts.join(', ');

      const businessData = {
        name: formData.name.trim(),
        category: formData.category,
        address: fullAddress || formData.address,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        website: formData.website.trim() || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        opening_hours: formData.opening_hours.trim() || null,
        source: 'manual',
        city: formData.city.trim() || null,
        state: formData.state.trim() || null
      };

      const businessId = await addBusiness(businessData);
      const newBusiness = {
        id: businessId,
        ...businessData
      };

      onSuccess(newBusiness);
    } catch (error) {
      console.error('Error creating business:', error);
      alert('Failed to create business. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Business</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">
                  Business Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter business name"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {Object.entries(CATEGORIES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Contact Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="business@example.com"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group full-width">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
                {errors.website && <span className="error-text">{errors.website}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Address</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="address">Street Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main St"
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="New York"
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="NY"
                  maxLength={2}
                />
              </div>

              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="10001"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Additional Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="latitude">Latitude</label>
                <input
                  type="number"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="40.7128"
                  step="any"
                />
                {errors.latitude && <span className="error-text">{errors.latitude}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="longitude">Longitude</label>
                <input
                  type="number"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="-74.0060"
                  step="any"
                />
                {errors.longitude && <span className="error-text">{errors.longitude}</span>}
              </div>

              <div className="form-group full-width">
                <label htmlFor="opening_hours">Opening Hours</label>
                <input
                  type="text"
                  id="opening_hours"
                  name="opening_hours"
                  value={formData.opening_hours}
                  onChange={handleChange}
                  placeholder="Mo-Fr 09:00-17:00"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <div className="spinner-small"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Create Business
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

