import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import './SearchableSelect.css';

export default function SearchableSelect({
  id,
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  disabled = false,
  className = ''
}) {
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
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
    setSearchQuery('');
  };

  const filteredOptions = options.filter(option => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const label = typeof option === 'string' ? option : (option.label || option.value || option);
    return label.toLowerCase().includes(query);
  });

  const getDisplayValue = () => {
    if (!value) return placeholder;
    const option = options.find(opt => {
      const optValue = typeof opt === 'string' ? opt : opt.value;
      return optValue === value;
    });
    if (!option) return value;
    return typeof option === 'string' ? option : (option.label || option.value);
  };

  const getOptionValue = (option) => {
    return typeof option === 'string' ? option : option.value;
  };

  const getOptionLabel = (option) => {
    return typeof option === 'string' ? option : (option.label || option.value);
  };

  return (
    <div className={`searchable-select ${className}`} ref={dropdownRef}>
      <button
        type="button"
        id={id}
        className={`searchable-select-button ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="searchable-select-value">{getDisplayValue()}</span>
        <ChevronDown size={16} className={isOpen ? 'open' : ''} />
      </button>
      {isOpen && (
        <div className="searchable-select-menu">
          <div className="searchable-select-search">
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
                } else if (e.key === 'Enter' && filteredOptions.length === 1) {
                  handleSelect(getOptionValue(filteredOptions[0]));
                }
              }}
            />
          </div>
          <div className="searchable-select-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const optionValue = getOptionValue(option);
                const optionLabel = getOptionLabel(option);
                const isSelected = optionValue === value;
                return (
                  <button
                    key={typeof option === 'string' ? option : (option.value || index)}
                    type="button"
                    className={`searchable-select-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(optionValue)}
                  >
                    <span className="searchable-select-option-label">{optionLabel}</span>
                    {isSelected && (
                      <span className="searchable-select-option-check">✓</span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="searchable-select-no-results">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

