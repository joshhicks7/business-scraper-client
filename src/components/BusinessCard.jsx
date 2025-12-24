import { Phone, Mail, Globe, MapPin, ExternalLink } from 'lucide-react';
import './BusinessCard.css';

export default function BusinessCard({ business, tracking, onClick }) {
  const status = tracking?.status || 'none';
  const statusLabels = {
    'none': null,
    'contacted': { label: 'Contacted', class: 'contacted' },
    'creating-site': { label: 'Creating Site', class: 'creating-site' },
    'scheduled-meeting': { label: 'Meeting Scheduled', class: 'scheduled-meeting' }
  };
  const statusInfo = statusLabels[status];

  return (
    <div className="business-card" onClick={onClick}>
      <div className="card-header">
        <h3 className="card-title">{business.name || 'Unknown Business'}</h3>
        {statusInfo && (
          <span className={`status-badge ${statusInfo.class}`}>
            {statusInfo.label}
          </span>
        )}
      </div>

      <div className="card-content">
        {business.address && (
          <div className="card-item">
            <MapPin size={16} />
            <span>{business.address}</span>
          </div>
        )}

        {business.phone && (
          <div className="card-item">
            <Phone size={16} />
            <a href={`tel:${business.phone}`} onClick={(e) => e.stopPropagation()}>
              {business.phone}
            </a>
          </div>
        )}

        {business.email && (
          <div className="card-item">
            <Mail size={16} />
            <a href={`mailto:${business.email}`} onClick={(e) => e.stopPropagation()}>
              {business.email}
            </a>
          </div>
        )}

        {business.website && (
          <div className="card-item">
            <Globe size={16} />
            <a
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="website-link"
            >
              {business.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              <ExternalLink size={12} />
            </a>
          </div>
        )}

        {!business.address && !business.phone && !business.email && !business.website && (
          <div className="card-item empty">
            <span>No contact information available</span>
          </div>
        )}
      </div>

      {tracking?.notes && (
        <div className="card-notes">
          <p>{tracking.notes}</p>
        </div>
      )}

      <div className="card-footer">
        <span className="card-source">{business.source === 'manual' ? 'Manual Entry' : 'OSM'}</span>
        {business.category && (
          <span className="card-category">{business.category}</span>
        )}
      </div>
    </div>
  );
}

