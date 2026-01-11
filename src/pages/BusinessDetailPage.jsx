import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Globe, MapPin, Trash2, Save, Calendar, Plus, User } from 'lucide-react';
import { getBusiness, updateBusiness, deleteBusiness, saveTrackingData, getTrackingData, getTimelineEvents, addTimelineEvent, deleteTimelineEvent } from '../services/firebaseService';
import { format } from 'date-fns';
import WebsiteList from '../components/WebsiteList';
import Notification from '../components/Notification';
import Timeline from '../components/Timeline';
import AddEventModal from '../components/AddEventModal';
import SearchableSelect from '../components/SearchableSelect';
import { CATEGORIES } from '../utils/categories';
import './BusinessDetailPage.css';

export default function BusinessDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [status, setStatus] = useState('none');
  const [notes, setNotes] = useState('');
  const [websites, setWebsites] = useState([]);
  const [demos, setDemos] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Editable business fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [openingHours, setOpeningHours] = useState('');

  useEffect(() => {
    loadBusiness();
  }, [id]);

  const loadBusiness = async () => {
    try {
      setLoading(true);
      const foundBusiness = await getBusiness(id);
      
      if (!foundBusiness) {
        showNotification('Business not found', 'error');
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      setBusiness(foundBusiness);
      
      // Set editable fields
      setName(foundBusiness.name || '');
      setCategory(foundBusiness.category || '');
      setPhone(foundBusiness.phone || '');
      setEmail(foundBusiness.email || '');
      setOwnerName(foundBusiness.owner_name || foundBusiness.ownerName || '');
      
      // Parse address if it's a string
      if (foundBusiness.address) {
        const addressParts = foundBusiness.address.split(',').map(s => s.trim());
        if (addressParts.length >= 4) {
          setAddress(addressParts[0]);
          setCity(addressParts[1]);
          setState(addressParts[2]);
          setZipCode(addressParts[3]);
        } else if (addressParts.length === 3) {
          setAddress(addressParts[0]);
          setCity(addressParts[1]);
          setState(addressParts[2]);
        } else {
          setAddress(foundBusiness.address);
        }
      }
      
      // Set individual address fields if they exist
      if (foundBusiness.city) setCity(foundBusiness.city);
      if (foundBusiness.state) setState(foundBusiness.state);
      if (foundBusiness.zipCode || foundBusiness.zip_code) setZipCode(foundBusiness.zipCode || foundBusiness.zip_code);
      setOpeningHours(foundBusiness.opening_hours || '');
      
      // Load tracking data
      const tracking = await getTrackingData(id);
      setTrackingData(tracking);
      setStatus(tracking?.status || 'none');
      setNotes(tracking?.notes || '');

      // Load timeline events (don't fail if this errors)
      try {
        const events = await getTimelineEvents(id);
        setTimelineEvents(events);
      } catch (timelineError) {
        console.error('Error loading timeline events:', timelineError);
        // Set empty array so page still loads
        setTimelineEvents([]);
        // Only show notification if it's not an index error (index errors are handled silently with fallback)
        if (!timelineError.message?.includes('index') && timelineError.code !== 'failed-precondition') {
          showNotification('Failed to load timeline events', 'error');
        }
      }

      // Set websites and demos
      if (foundBusiness.websites) {
        setWebsites(Array.isArray(foundBusiness.websites) ? foundBusiness.websites : [foundBusiness.websites]);
      } else if (foundBusiness.website) {
        setWebsites([foundBusiness.website]);
      } else {
        setWebsites([]);
      }

      if (foundBusiness.demos) {
        setDemos(Array.isArray(foundBusiness.demos) ? foundBusiness.demos : [foundBusiness.demos]);
      } else if (foundBusiness.our_website) {
        setDemos([foundBusiness.our_website]);
      } else {
        setDemos([]);
      }
    } catch (error) {
      console.error('Error loading business:', error);
      showNotification('Failed to load business', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!business?.id) return;

    setSaving(true);
    try {
      // Save tracking data
      await saveTrackingData(business.id, {
        status,
        notes,
        businessId: business.id
      });

      // Update business
      if (!business.id.startsWith('search-')) {
        // Build full address
        const addressParts = [];
        if (address) addressParts.push(address);
        if (city) addressParts.push(city);
        if (state) addressParts.push(state);
        if (zipCode) addressParts.push(zipCode);
        const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : null;
        
        await updateBusiness(business.id, {
          name: name.trim() || business.name,
          category: category || business.category,
          phone: phone.trim() || null,
          email: email.trim() || null,
          owner_name: ownerName.trim() || null,
          address: fullAddress || address || business.address,
          city: city.trim() || null,
          state: state.trim() || null,
          zipCode: zipCode.trim() || null,
          opening_hours: openingHours.trim() || null,
          websites: websites.length > 0 ? websites : null,
          demos: demos.length > 0 ? demos : null,
          updatedAt: new Date()
        });
      }

      // Reload business data
      await loadBusiness();
      showNotification('Changes saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving:', error);
      showNotification('Failed to save changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!business?.id || business.id.startsWith('search-')) {
      return;
    }

    setSaving(true);
    try {
      await deleteBusiness(business.id);
      showNotification('Business deleted successfully', 'success');
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      console.error('Error deleting:', error);
      showNotification('Failed to delete business', 'error');
      setSaving(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddEvent = async (eventData) => {
    if (!business?.id) return;

    setSaving(true);
    try {
      await addTimelineEvent(business.id, eventData);
      const events = await getTimelineEvents(business.id);
      setTimelineEvents(events);
      showNotification('Event added successfully!', 'success');
    } catch (error) {
      console.error('Error adding event:', error);
      showNotification('Failed to add event', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!business?.id) return;

    setSaving(true);
    try {
      await deleteTimelineEvent(eventId);
      const events = await getTimelineEvents(business.id);
      setTimelineEvents(events);
      showNotification('Event deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting event:', error);
      showNotification('Failed to delete event', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="business-detail-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading business...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="business-detail-page">
        <div className="empty-state">
          <p>Business not found</p>
          <Link to="/" className="btn btn-primary">Go Back</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="business-detail-page">
      <div className="business-detail-header">
        <Link to="/" className="back-button">
          <ArrowLeft size={20} />
          Back
        </Link>
        <div className="header-actions">
          {!business.id.startsWith('search-') && (
            <button
              className="btn btn-danger"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving}
            >
              <Trash2 size={18} />
              Delete
            </button>
          )}
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="spinner-small"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      <div className="business-detail-content">
        <div className="detail-section">
          <h3 className="section-title">Basic Information</h3>
          <div className="tracking-section">
            <div className="form-grid">
              <div className="form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Business Name"
                  disabled={business.id.startsWith('search-')}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <SearchableSelect
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={Object.entries(CATEGORIES)
                    .map(([key, label]) => ({
                      value: key,
                      label: label
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label))}
                  placeholder="Select category..."
                  disabled={business.id.startsWith('search-')}
                />
              </div>

              <div className="form-group">
                <label>Owner Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Owner Name"
                  disabled={business.id.startsWith('search-')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3 className="section-title">Contact Information</h3>
          <div className="tracking-section">
            <div className="form-grid">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  disabled={business.id.startsWith('search-')}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="business@example.com"
                  disabled={business.id.startsWith('search-')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3 className="section-title">Address</h3>
          <div className="tracking-section">
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St"
                  disabled={business.id.startsWith('search-')}
                />
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  disabled={business.id.startsWith('search-')}
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  maxLength={2}
                  disabled={business.id.startsWith('search-')}
                />
              </div>

              <div className="form-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="ZIP Code"
                  disabled={business.id.startsWith('search-')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3 className="section-title">Additional Information</h3>
          <div className="tracking-section">
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Opening Hours</label>
                <input
                  type="text"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  placeholder="Mo-Fr 09:00-17:00"
                  disabled={business.id.startsWith('search-')}
                />
              </div>

              {business.latitude && business.longitude && (
                <div className="form-group full-width">
                  <label>Location Coordinates</label>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${business.latitude}&mlon=${business.longitude}&zoom=15`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="location-link"
                  >
                    View on Map ({business.latitude.toFixed(6)}, {business.longitude.toFixed(6)})
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="detail-section">
          <div className="section-header-with-action">
            <h3 className="section-title">Timeline</h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddEventModal(true)}
              disabled={saving}
            >
              <Plus size={18} />
              Add Event
            </button>
          </div>
          <div className="timeline-section">
            <Timeline
              events={timelineEvents}
              onDeleteEvent={handleDeleteEvent}
              canDelete={!business.id.startsWith('search-')}
            />
          </div>
        </div>

        <div className="detail-section">
          <h3 className="section-title">Tracking & Notes</h3>
          <div className="tracking-section">
            <div className="status-group">
              <label>Status</label>
              <div className="status-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="status"
                    value="none"
                    checked={status === 'none'}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                  <span>No Status</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="status"
                    value="contacted"
                    checked={status === 'contacted'}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                  <span>✓ Contacted</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="status"
                    value="creating-site"
                    checked={status === 'creating-site'}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                  <span>🚀 Creating Site</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="status"
                    value="scheduled-meeting"
                    checked={status === 'scheduled-meeting'}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                  <span>📅 Scheduled Meeting</span>
                </label>
              </div>
            </div>

            {trackingData?.updatedAt && (
              <div className="tracking-date">
                Last updated: {format(trackingData.updatedAt.toDate(), 'PPp')}
              </div>
            )}

            <div className="notes-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this business..."
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3 className="section-title">Websites & Demos</h3>
          <div className="tracking-section">
            <div className="notes-group">
              <WebsiteList
                websites={websites}
                onChange={setWebsites}
                placeholder="https://example.com"
                label="Business Websites"
              />
            </div>

            <div className="notes-group">
              <WebsiteList
                websites={demos}
                onChange={setDemos}
                placeholder="https://demo.example.com"
                label="Demos"
              />
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm">
            <p>Are you sure you want to delete this business?</p>
            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddEventModal && (
        <AddEventModal
          isOpen={showAddEventModal}
          onClose={() => setShowAddEventModal(false)}
          onSave={handleAddEvent}
          businessPhone={business?.phone}
        />
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

