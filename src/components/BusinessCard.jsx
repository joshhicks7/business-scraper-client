import { useNavigate } from 'react-router-dom';
import { Phone, Mail, Globe, MapPin, ExternalLink, Save, Check } from 'lucide-react';
import './BusinessCard.css';

export default function BusinessCard({ business, tracking, onSave, isSaved }) {
  const navigate = useNavigate();
  const status = tracking?.status || 'none';
  const statusLabels = {
    'none': null,
    'contacted': { label: 'Contacted', class: 'contacted' },
    'creating-site': { label: 'Creating Site', class: 'creating-site' },
    'scheduled-meeting': { label: 'Meeting Scheduled', class: 'scheduled-meeting' }
  };
  const statusInfo = statusLabels[status];

  const handleCardClick = () => {
    if (business.id && !business.id.startsWith('search-')) {
      navigate(`/business/${business.id}`);
    }
  };

  return (
    <div className="business-card" onClick={handleCardClick}>
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

        {(() => {
          // Handle backward compatibility - convert single website to array
          const businessWebsites = business?.websites 
            ? (Array.isArray(business.websites) ? business.websites : [business.websites])
            : (business?.website ? [business.website] : []);
          
          return businessWebsites.length > 0 && businessWebsites.map((website, index) => (
            <div key={index} className="card-item">
              <Globe size={16} />
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="website-link"
              >
                {website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                <ExternalLink size={12} />
              </a>
            </div>
          ));
        })()}

        {(() => {
          // Handle backward compatibility - convert single demo to array
          const businessDemos = business?.demos 
            ? (Array.isArray(business.demos) ? business.demos : [business.demos])
            : (business?.our_website ? [business.our_website] : []);
          
          return businessDemos.length > 0 && businessDemos.map((demo, index) => (
            <div key={index} className="card-item">
              <Globe size={16} />
              <a
                href={demo}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="website-link demo-link"
              >
                Demo: {demo.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                <ExternalLink size={12} />
              </a>
            </div>
          ));
        })()}

        {!business.address && !business.phone && !business.email && 
         !(business?.websites?.length || business?.website) && 
         !(business?.demos?.length || business?.our_website) && (
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
        <div className="card-footer-left">
          <span className="card-source">{business.source === 'manual' ? 'Manual Entry' : 'OSM'}</span>
          {business.category && (
            <span className="card-category">{business.category}</span>
          )}
        </div>
        {onSave && !isSaved && (
          <button
            className="save-btn"
            onClick={(e) => {
              e.stopPropagation();
              onSave(business);
            }}
            title="Save to database"
          >
            <Save size={16} />
            Save
          </button>
        )}
        {isSaved && (
          <span className="saved-badge">
            <Check size={14} />
            Saved
          </span>
        )}
      </div>
    </div>
  );
}


