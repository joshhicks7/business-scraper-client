import { useState, useMemo, useEffect, useRef } from 'react';
import { Download, Search as SearchIcon } from 'lucide-react';
import BusinessCard from './BusinessCard';
import './BusinessList.css';

export default function BusinessList({
  businesses,
  trackingData,
  onBusinessUpdated,
  onBusinessDeleted,
  onSaveBusiness,
  savedBusinessIds,
  savedBusinesses = [],
  loading,
  onFilterChange,
  allBusinesses
}) {
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

    // Sort by name (A-Z)
    result.sort((a, b) => {
      return (a.name || '').localeCompare(b.name || '');
    });

    return result;
  }, [businesses, searchQuery]);

  // Only call onFilterChange when the filtered results actually change
  // Compare by length and IDs to avoid infinite loops
  const prevFilteredRef = useRef();
  useEffect(() => {
    const prevIds = prevFilteredRef.current?.map(b => b.id).join(',');
    const currentIds = filteredAndSorted.map(b => b.id).join(',');
    
    // Only update if the filtered results have actually changed
    if (prevIds !== currentIds || prevFilteredRef.current?.length !== filteredAndSorted.length) {
      prevFilteredRef.current = filteredAndSorted;
      onFilterChange(filteredAndSorted);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredAndSorted]);


  const exportCSV = () => {
    if (filteredAndSorted.length === 0) return;

    let csv = "Name,Status,Phone,Websites,Demos,Address,Email,Notes,Status Updated\n";
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
      // Handle both old single website and new arrays
      const websites = b.websites 
        ? (Array.isArray(b.websites) ? b.websites.join('; ') : b.websites)
        : (b.website || '');
      const demos = b.demos 
        ? (Array.isArray(b.demos) ? b.demos.join('; ') : b.demos)
        : (b.our_website || '');
      const websitesStr = (websites || '').replace(/"/g, '""');
      const demosStr = (demos || '').replace(/"/g, '""');
      const address = (b.address || '').replace(/"/g, '""');
      const email = (b.email || '').replace(/"/g, '""');
      const notes = (tracking.notes || '').replace(/"/g, '""');
      const date = tracking.updatedAt?.toDate ? tracking.updatedAt.toDate().toLocaleString() : '';
      
      csv += `"${name}","${statusDisplay}","${phone}","${websitesStr}","${demosStr}","${address}","${email}","${notes}","${date}"\n`;
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
      </div>

      {filteredAndSorted.length === 0 ? (
        <div className="empty-state">
          <p>No businesses found{searchQuery.trim() ? ' matching your search' : ''}</p>
        </div>
      ) : (
        <div className="business-grid">
          {filteredAndSorted.map(business => {
            // Check if business is saved by ID or osm_identifier
            let isSaved = false;
            if (savedBusinessIds) {
              isSaved = savedBusinessIds.has(business.id);
              // Also check by osm_identifier if ID doesn't match
              if (!isSaved && business.osm_identifier) {
                // Check if any saved business has this osm_identifier
                isSaved = savedBusinesses.some(savedBusiness => 
                  savedBusiness.osm_identifier === business.osm_identifier
                );
              }
            } else {
              isSaved = business.isSaved !== false;
            }
            return (
            <BusinessCard
              key={business.id}
              business={business}
              tracking={trackingData[business.id]}
              onSave={onSaveBusiness}
              isSaved={isSaved}
            />
            );
          })}
        </div>
      )}
    </div>
  );
}

