import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { addBusiness } from '../services/firebaseService';
import SearchableSelect from '../components/SearchableSelect';
import WebsiteList from '../components/WebsiteList';
import Notification from '../components/Notification';
import { CATEGORIES } from '../utils/categories';
import './CreateBusinessPage.css';

export default function CreateBusinessPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: 'restaurant',
    address: '',
    phone: '',
    email: '',
    owner_name: '',
    websites: [],
    demos: [],
    city: '',
    state: '',
    zipCode: '',
    latitude: '',
    longitude: '',
    opening_hours: ''
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

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

    // Validate all websites
    formData.websites.forEach((website, index) => {
      if (website && !/^https?:\/\/.+/.test(website)) {
        newErrors[`website_${index}`] = 'Website must start with http:// or https://';
      }
    });

    // Validate all demos
    formData.demos.forEach((demo, index) => {
      if (demo && !/^https?:\/\/.+/.test(demo)) {
        newErrors[`demo_${index}`] = 'Demo must start with http:// or https://';
      }
    });

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
      showNotification('Please fix the errors in the form', 'error');
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
        owner_name: formData.owner_name.trim() || null,
        websites: formData.websites.length > 0 ? formData.websites : null,
        demos: formData.demos.length > 0 ? formData.demos : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        opening_hours: formData.opening_hours.trim() || null,
        source: 'manual',
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        zipCode: formData.zipCode.trim() || null
      };

      const businessId = await addBusiness(businessData);
      showNotification('Business created successfully!', 'success');
      
      // Navigate to the business detail page or back to home
      setTimeout(() => {
        navigate(`/business/${businessId}`);
      }, 1000);
    } catch (error) {
      console.error('Error creating business:', error);
      showNotification('Failed to create business. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <button
            className="btn btn-secondary btn-icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>
        <div>
          <h1>Create New Business</h1>
          <p>Add a new business to your database</p>
        </div>
      </div>

      <div className="create-business-page">
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
                <SearchableSelect
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange({ target: { name: 'category', value: e.target.value } })}
                  options={Object.entries(CATEGORIES)
                    .map(([key, label]) => ({
                      value: key,
                      label: label
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label))}
                  placeholder="Select category..."
                />
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

              <div className="form-group">
                <label htmlFor="owner_name">Owner Name</label>
                <input
                  type="text"
                  id="owner_name"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleChange}
                  placeholder="Owner Name"
                />
              </div>

              <div className="form-group full-width">
                <WebsiteList
                  websites={formData.websites}
                  onChange={(websites) => setFormData(prev => ({ ...prev, websites }))}
                  placeholder="https://example.com"
                  label="Business Websites"
                />
              </div>

              <div className="form-group full-width">
                <WebsiteList
                  websites={formData.demos}
                  onChange={(demos) => setFormData(prev => ({ ...prev, demos }))}
                  placeholder="https://demo.example.com"
                  label="Demos"
                />
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

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={saving}>
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

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
}

