import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';
import './FilterDropdown.css';

export default function FilterDropdown({ label, value, onChange, options = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Focus search input when dropdown opens
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const filteredOptions = options.filter(option => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return option.label.toLowerCase().includes(query);
  });

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  const getDisplayValue = () => {
    if (value === null || value === undefined) return 'Any';
    const option = options.find(opt => opt.value === value);
    return option ? option.label : 'Any';
  };

  return (
    <div className="filter-dropdown" ref={dropdownRef}>
      <button
        className={`filter-dropdown-button ${value !== null ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="filter-label">{label}</span>
        <span className="filter-value">{getDisplayValue()}</span>
        {value !== null && (
          <button
            className="filter-clear"
            onClick={handleClear}
            aria-label="Clear filter"
          >
            <X size={14} />
          </button>
        )}
        <ChevronDown size={16} className={isOpen ? 'open' : ''} />
      </button>
      {isOpen && (
        <div className="filter-dropdown-menu">
          <div className="filter-search">
            <Search size={16} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsOpen(false);
                  setSearchQuery('');
                }
              }}
            />
          </div>
          <div className="filter-options-list">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  className={`filter-option ${value === option.value ? 'selected' : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  <span className="filter-option-label">{option.label}</span>
                  {value === option.value && (
                    <span className="filter-option-check">✓</span>
                  )}
                </button>
              ))
            ) : (
              <div className="filter-no-results">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

