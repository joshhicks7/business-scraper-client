import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import './FilterDropdown.css';

export default function FilterDropdown({ label, value, onChange, options = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

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
          {options.map((option) => (
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
          ))}
        </div>
      )}
    </div>
  );
}

