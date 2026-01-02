import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Globe, MapPin, Trash2, Save, Calendar } from 'lucide-react';
import { getBusiness, updateBusiness, deleteBusiness, saveTrackingData, getTrackingData } from '../services/firebaseService';
import { format } from 'date-fns';
import WebsiteList from '../components/WebsiteList';
import Notification from '../components/Notification';
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
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState(null);

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
      
      // Load tracking data
      const tracking = await getTrackingData(id);
      setTrackingData(tracking);
      setStatus(tracking?.status || 'none');
      setNotes(tracking?.notes || '');

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
        await updateBusiness(business.id, {
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
          <h1 className="business-name">{business.name || 'Unknown Business'}</h1>
          <div className="detail-grid">
            {business.address && (
              <div className="detail-item">
                <MapPin size={18} />
                <div>
                  <label>Address</label>
                  <p>{business.address}</p>
                </div>
              </div>
            )}

            {business.phone && (
              <div className="detail-item">
                <Phone size={18} />
                <div>
                  <label>Phone</label>
                  <a href={`tel:${business.phone}`}>{business.phone}</a>
                </div>
              </div>
            )}

            {business.email && (
              <div className="detail-item">
                <Mail size={18} />
                <div>
                  <label>Email</label>
                  <a href={`mailto:${business.email}`}>{business.email}</a>
                </div>
              </div>
            )}

            {(() => {
              const businessWebsites = business?.websites 
                ? (Array.isArray(business.websites) ? business.websites : [business.websites])
                : (business?.website ? [business.website] : []);
              
              return businessWebsites.length > 0 && businessWebsites.map((website, index) => (
                <div key={index} className="detail-item">
                  <Globe size={18} />
                  <div>
                    <label>{index === 0 ? 'Business Website' : `Website ${index + 1}`}</label>
                    <a href={website} target="_blank" rel="noopener noreferrer">
                      {website}
                    </a>
                  </div>
                </div>
              ));
            })()}

            {(() => {
              const businessDemos = business?.demos 
                ? (Array.isArray(business.demos) ? business.demos : [business.demos])
                : (business?.our_website ? [business.our_website] : []);
              
              return businessDemos.length > 0 && businessDemos.map((demo, index) => (
                <div key={index} className="detail-item">
                  <Globe size={18} />
                  <div>
                    <label>{index === 0 ? 'Demo' : `Demo ${index + 1}`}</label>
                    <a href={demo} target="_blank" rel="noopener noreferrer">
                      {demo}
                    </a>
                  </div>
                </div>
              ));
            })()}

            {business.opening_hours && (
              <div className="detail-item">
                <Calendar size={18} />
                <div>
                  <label>Opening Hours</label>
                  <p>{business.opening_hours}</p>
                </div>
              </div>
            )}

            {business.latitude && business.longitude && (
              <div className="detail-item">
                <MapPin size={18} />
                <div>
                  <label>Location</label>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${business.latitude}&mlon=${business.longitude}&zoom=15`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Map ({business.latitude.toFixed(6)}, {business.longitude.toFixed(6)})
                  </a>
                </div>
              </div>
            )}
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

