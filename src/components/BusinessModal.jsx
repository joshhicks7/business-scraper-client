import { useState, useEffect } from 'react';
import { X, Phone, Mail, Globe, MapPin, Trash2, Save, Calendar } from 'lucide-react';
import { updateBusiness, deleteBusiness, saveTrackingData } from '../services/firebaseService';
import { format } from 'date-fns';
import WebsiteList from './WebsiteList';
import './BusinessModal.css';

export default function BusinessModal({
  business,
  trackingData,
  onClose,
  onUpdate,
  onDelete
}) {
  const [status, setStatus] = useState(trackingData?.status || 'none');
  const [notes, setNotes] = useState(trackingData?.notes || '');
  const [websites, setWebsites] = useState(() => {
    // Handle backward compatibility - convert single website to array
    if (business?.websites) return Array.isArray(business.websites) ? business.websites : [business.websites];
    if (business?.website) return [business.website];
    return [];
  });
  const [demos, setDemos] = useState(() => {
    // Handle backward compatibility - convert single demo to array
    if (business?.demos) return Array.isArray(business.demos) ? business.demos : [business.demos];
    if (business?.our_website) return [business.our_website];
    return [];
  });
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setStatus(trackingData?.status || 'none');
    setNotes(trackingData?.notes || '');
    // Update websites and demos when business changes
    if (business?.websites) {
      setWebsites(Array.isArray(business.websites) ? business.websites : [business.websites]);
    } else if (business?.website) {
      setWebsites([business.website]);
    } else {
      setWebsites([]);
    }
    if (business?.demos) {
      setDemos(Array.isArray(business.demos) ? business.demos : [business.demos]);
    } else if (business?.our_website) {
      setDemos([business.our_website]);
    } else {
      setDemos([]);
    }
  }, [trackingData, business]);

  const handleSave = async () => {
    if (!business.id) return;

    setSaving(true);
    try {
      // Save tracking data
      await saveTrackingData(business.id, {
        status,
        notes,
        businessId: business.id
      });

      // Update business if needed
      const updatedBusiness = { ...business, websites, demos };
      if (business.id.startsWith('search-')) {
        // This is a search result, save it to database first
        // For now, just update tracking
      } else {
        await updateBusiness(business.id, {
          websites: websites.length > 0 ? websites : null,
          demos: demos.length > 0 ? demos : null,
          updatedAt: new Date()
        });
      }

      onUpdate(updatedBusiness);
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!business.id || business.id.startsWith('search-')) {
      // Can't delete search results
      return;
    }

    setSaving(true);
    try {
      await deleteBusiness(business.id);
      onDelete(business.id);
      onClose();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete business');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{business.name || 'Business Details'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <h3 className="section-title">Contact Information</h3>
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
                // Handle backward compatibility
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
                // Handle backward compatibility
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

        <div className="modal-footer">
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
          <div className="footer-actions">
            <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
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

        {showDeleteConfirm && (
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
        )}
      </div>
    </div>
  );
}


