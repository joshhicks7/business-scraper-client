import { useState, useMemo, useEffect } from 'react';
import { Filter, Download, Search as SearchIcon, X } from 'lucide-react';
import BusinessCard from './BusinessCard';
import FilterDropdown from './FilterDropdown';
import './BusinessList.css';

// Filter options for Google Sheets-style filters
const FILTER_OPTIONS = {
  boolean: [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' },
    { value: null, label: 'Any' }
  ],
  status: [
    { value: 'none', label: 'No Status' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'creating-site', label: 'Creating Site' },
    { value: 'scheduled-meeting', label: 'Scheduled Meeting' },
    { value: null, label: 'Any' }
  ]
};

export default function BusinessList({
  businesses,
  trackingData,
  onBusinessClick,
  onBusinessUpdated,
  onBusinessDeleted,
  loading,
  onFilterChange,
  allBusinesses
}) {
  // Default to showing only businesses without websites
  const [filters, setFilters] = useState({
    hasWebsite: false, // false = no website (default)
    hasPhone: null,
    hasEmail: null,
    hasAddress: null,
    status: null
  });
  const [sortBy, setSortBy] = useState('name-asc');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAndSorted = useMemo(() => {
    let result = [...businesses];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.name?.toLowerCase().includes(query) ||
        b.address?.toLowerCase().includes(query) ||
        b.phone?.includes(query) ||
        b.email?.toLowerCase().includes(query)
      );
    }

    // Apply filters (Google Sheets-style: true/false/null)
    result = result.filter(b => {
      const tracking = trackingData[b.id] || {};
      const status = tracking.status || 'none';

      // Website filter (default: false = no website)
      if (filters.hasWebsite !== null) {
        const hasWebsite = !!b.website;
        if (filters.hasWebsite !== hasWebsite) return false;
      }

      // Phone filter
      if (filters.hasPhone !== null) {
        const hasPhone = !!b.phone;
        if (filters.hasPhone !== hasPhone) return false;
      }

      // Email filter
      if (filters.hasEmail !== null) {
        const hasEmail = !!b.email;
        if (filters.hasEmail !== hasEmail) return false;
      }

      // Address filter
      if (filters.hasAddress !== null) {
        const hasAddress = !!b.address;
        if (filters.hasAddress !== hasAddress) return false;
      }

      // Status filter
      if (filters.status !== null && filters.status !== status) {
        return false;
      }

      return true;
    });

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'has-website':
          const aHasWeb = a.website ? 1 : 0;
          const bHasWeb = b.website ? 1 : 0;
          if (bHasWeb !== aHasWeb) return bHasWeb - aHasWeb;
          return (a.name || '').localeCompare(b.name || '');
        case 'has-phone':
          const aHasPhone = a.phone ? 1 : 0;
          const bHasPhone = b.phone ? 1 : 0;
          if (bHasPhone !== aHasPhone) return bHasPhone - aHasPhone;
          return (a.name || '').localeCompare(b.name || '');
        default:
          return 0;
      }
    });

    return result;
  }, [businesses, filters, sortBy, searchQuery, trackingData]);

  useEffect(() => {
    onFilterChange(filteredAndSorted);
  }, [filteredAndSorted, onFilterChange]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      hasWebsite: false, // Keep default: no website
      hasPhone: null,
      hasEmail: null,
      hasAddress: null,
      status: null
    });
    setSearchQuery('');
  };

  const hasActiveFilters = () => {
    return filters.hasPhone !== null ||
           filters.hasEmail !== null ||
           filters.hasAddress !== null ||
           filters.status !== null ||
           searchQuery.trim() !== '' ||
           filters.hasWebsite !== false; // false is the default (no website), so check if changed
  };

  const exportCSV = () => {
    if (filteredAndSorted.length === 0) return;

    let csv = "Name,Status,Phone,Website,Address,Email,Notes,Status Updated\n";
    filteredAndSorted.forEach(b => {
      const tracking = trackingData[b.id] || {};
      const status = tracking.status || 'None';
      const statusDisplay = {
        'none': 'None',
        'contacted': 'Contacted',
        'creating-site': 'Creating Site',
        'scheduled-meeting': 'Scheduled Meeting'
      }[status] || 'None';
      
      const name = (b.name || '').replace(/"/g, '""');
      const phone = (b.phone || '').replace(/"/g, '""');
      const website = (b.website || '').replace(/"/g, '""');
      const address = (b.address || '').replace(/"/g, '""');
      const email = (b.email || '').replace(/"/g, '""');
      const notes = (tracking.notes || '').replace(/"/g, '""');
      const date = tracking.updatedAt?.toDate ? tracking.updatedAt.toDate().toLocaleString() : '';
      
      csv += `"${name}","${statusDisplay}","${phone}","${website}","${address}","${email}","${notes}","${date}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `businesses_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading && businesses.length === 0) {
    return (
      <div className="business-list">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading businesses...</p>
        </div>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="business-list">
        <div className="empty-state">
          <SearchIcon size={64} />
          <h3>No businesses yet</h3>
          <p>Search for businesses or add one manually to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="business-list">
      <div className="business-list-header">
        <div className="header-left">
          <h2>Businesses</h2>
          <span className="results-count">
            {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'result' : 'results'}
            {businesses.length !== filteredAndSorted.length && ` (of ${businesses.length})`}
          </span>
        </div>
        <button className="btn btn-secondary" onClick={exportCSV} disabled={filteredAndSorted.length === 0}>
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="filters-section">
        <div className="filters-header">
          <div className="search-box">
            <SearchIcon size={18} />
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {hasActiveFilters() && (
            <button className="clear-filters-btn" onClick={clearAllFilters}>
              <X size={16} />
              Clear Filters
            </button>
          )}
        </div>

        <div className="filters-row">
          <FilterDropdown
            label="Website"
            value={filters.hasWebsite}
            onChange={(value) => handleFilterChange('hasWebsite', value)}
            options={FILTER_OPTIONS.boolean}
          />
          <FilterDropdown
            label="Phone"
            value={filters.hasPhone}
            onChange={(value) => handleFilterChange('hasPhone', value)}
            options={FILTER_OPTIONS.boolean}
          />
          <FilterDropdown
            label="Email"
            value={filters.hasEmail}
            onChange={(value) => handleFilterChange('hasEmail', value)}
            options={FILTER_OPTIONS.boolean}
          />
          <FilterDropdown
            label="Address"
            value={filters.hasAddress}
            onChange={(value) => handleFilterChange('hasAddress', value)}
            options={FILTER_OPTIONS.boolean}
          />
          <FilterDropdown
            label="Status"
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
            options={FILTER_OPTIONS.status}
          />
          <div className="sort-group">
            <label className="sort-label">Sort By</label>
            <select 
              className="sort-select"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="has-website">Has Website First</option>
              <option value="has-phone">Has Phone First</option>
            </select>
          </div>
        </div>
      </div>

      {filteredAndSorted.length === 0 ? (
        <div className="empty-state">
          <p>No businesses match your filters</p>
        </div>
      ) : (
        <div className="business-grid">
          {filteredAndSorted.map(business => (
            <BusinessCard
              key={business.id}
              business={business}
              tracking={trackingData[business.id]}
              onClick={() => onBusinessClick(business)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

