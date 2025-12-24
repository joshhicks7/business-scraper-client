import { useState, useMemo } from 'react';
import { Filter, Download, Search as SearchIcon } from 'lucide-react';
import BusinessCard from './BusinessCard';
import './BusinessList.css';

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
  const [filters, setFilters] = useState({
    hasWebsite: false,
    hasPhone: false,
    hasEmail: false,
    hasAddress: false,
    notContacted: false,
    statusContacted: false,
    statusCreatingSite: false,
    statusScheduledMeeting: false
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

    // Apply filters
    result = result.filter(b => {
      const tracking = trackingData[b.id] || {};
      const status = tracking.status || 'none';

      if (filters.hasWebsite && !b.website) return false;
      if (filters.hasPhone && !b.phone) return false;
      if (filters.hasEmail && !b.email) return false;
      if (filters.hasAddress && !b.address) return false;
      if (filters.notContacted && status !== 'none') return false;

      const statusFilters = [
        filters.statusContacted,
        filters.statusCreatingSite,
        filters.statusScheduledMeeting
      ];
      if (statusFilters.some(f => f)) {
        if (filters.statusContacted && status === 'contacted') return true;
        if (filters.statusCreatingSite && status === 'creating-site') return true;
        if (filters.statusScheduledMeeting && status === 'scheduled-meeting') return true;
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

  useMemo(() => {
    onFilterChange(filteredAndSorted);
  }, [filteredAndSorted, onFilterChange]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
        <div className="search-box">
          <SearchIcon size={18} />
          <input
            type="text"
            placeholder="Search businesses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label>
              <Filter size={16} />
              Filters
            </label>
            <div className="filter-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.hasWebsite}
                  onChange={(e) => handleFilterChange('hasWebsite', e.target.checked)}
                />
                Has Website
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.hasPhone}
                  onChange={(e) => handleFilterChange('hasPhone', e.target.checked)}
                />
                Has Phone
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.hasEmail}
                  onChange={(e) => handleFilterChange('hasEmail', e.target.checked)}
                />
                Has Email
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.hasAddress}
                  onChange={(e) => handleFilterChange('hasAddress', e.target.checked)}
                />
                Has Address
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.notContacted}
                  onChange={(e) => handleFilterChange('notContacted', e.target.checked)}
                />
                Not Contacted
              </label>
            </div>
          </div>

          <div className="filter-group">
            <label>Status Filters</label>
            <div className="filter-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.statusContacted}
                  onChange={(e) => handleFilterChange('statusContacted', e.target.checked)}
                />
                Contacted
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.statusCreatingSite}
                  onChange={(e) => handleFilterChange('statusCreatingSite', e.target.checked)}
                />
                Creating Site
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.statusScheduledMeeting}
                  onChange={(e) => handleFilterChange('statusScheduledMeeting', e.target.checked)}
                />
                Scheduled Meeting
              </label>
            </div>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
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

