import { useState } from 'react';
import { Plus, X, Globe, ExternalLink } from 'lucide-react';
import './WebsiteList.css';

export default function WebsiteList({ websites = [], onChange, placeholder = "https://example.com", label = "Websites" }) {
  const [newWebsite, setNewWebsite] = useState('');

  // Handle backward compatibility - convert single website string to array
  const websiteArray = Array.isArray(websites) ? websites : (websites ? [websites] : []);

  const handleAdd = () => {
    if (!newWebsite.trim()) return;
    
    // Validate URL format
    if (!/^https?:\/\/.+/.test(newWebsite.trim())) {
      alert('Website must start with http:// or https://');
      return;
    }

    const updated = [...websiteArray, newWebsite.trim()];
    onChange(updated);
    setNewWebsite('');
  };

  const handleRemove = (index) => {
    const updated = websiteArray.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="website-list">
      <label className="website-list-label">{label}</label>
      <div className="website-list-input-group">
        <input
          type="url"
          value={newWebsite}
          onChange={(e) => setNewWebsite(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="website-list-input"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="website-list-add-btn"
          title="Add website"
        >
          <Plus size={18} />
        </button>
      </div>
      {websiteArray.length > 0 && (
        <div className="website-list-items">
          {websiteArray.map((website, index) => (
            <div key={index} className="website-list-item">
              <Globe size={16} />
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="website-list-link"
              >
                {website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                <ExternalLink size={12} />
              </a>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="website-list-remove-btn"
                title="Remove website"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

