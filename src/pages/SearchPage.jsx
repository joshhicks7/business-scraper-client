import { useState, useEffect } from 'react';
import SearchPanel from '../components/SearchPanel';
import BusinessList from '../components/BusinessList';
import Notification from '../components/Notification';
import { getAllBusinesses, getAllTrackingData, addBusiness } from '../services/firebaseService';

export default function SearchPage() {
  const [savedBusinesses, setSavedBusinesses] = useState([]);
  const [unsavedBusinesses, setUnsavedBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [trackingData, setTrackingData] = useState({});
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSavedBusinesses();
    loadTrackingData();
  }, []);

  const loadSavedBusinesses = async () => {
    try {
      const data = await getAllBusinesses();
      setSavedBusinesses(data);
    } catch (error) {
      console.error('Error loading saved businesses:', error);
    }
  };

  const loadTrackingData = async () => {
    try {
      const data = await getAllTrackingData();
      setTrackingData(data);
    } catch (error) {
      console.error('Error loading tracking data:', error);
    }
  };

  const handleSearchResults = (results) => {
    setUnsavedBusinesses(results);
    // Combine saved and unsaved for display
    const allBusinesses = [...savedBusinesses, ...results];
    setFilteredBusinesses(allBusinesses);
    showNotification(`Found ${results.length} businesses! Click "Save" on any business to add it to your database.`, 'success');
  };

  const handleSaveBusiness = async (business) => {
    try {
      setLoading(true);
      
      // Check if business is already saved (by osm_identifier)
      if (business.osm_identifier) {
        const alreadySaved = savedBusinesses.find(
          b => b.osm_identifier === business.osm_identifier
        );
        if (alreadySaved) {
          showNotification('Business is already saved!', 'info');
          setLoading(false);
          return;
        }
      }
      
      // Save to database (will return existing ID if duplicate)
      const businessId = await addBusiness({
        ...business,
        source: business.source || 'osm'
      });
      
      // Check if we already have this business saved
      const existingSaved = savedBusinesses.find(b => b.id === businessId);
      if (existingSaved) {
        // Business already exists, just remove from unsaved
        setUnsavedBusinesses(prev => prev.filter(b => b.id !== business.id));
        showNotification('Business is already in your database!', 'info');
        setLoading(false);
        return;
      }
      
      // Create saved business object with database ID
      const savedBusiness = {
        ...business,
        id: businessId,
        isSaved: true
      };
      
      // Remove from unsaved and add to saved
      setUnsavedBusinesses(prev => prev.filter(b => b.id !== business.id));
      setSavedBusinesses(prev => [savedBusiness, ...prev]);
      
      // Update filtered businesses
      const allBusinesses = [...savedBusinesses, savedBusiness, ...unsavedBusinesses.filter(b => b.id !== business.id)];
      setFilteredBusinesses(allBusinesses);
      
      showNotification('Business saved successfully!', 'success');
      loadTrackingData(); // Reload tracking data
    } catch (error) {
      console.error('Error saving business:', error);
      showNotification('Failed to save business', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessUpdated = (updatedBusiness) => {
    // Check if it's a saved business
    const isSaved = savedBusinesses.some(b => b.id === updatedBusiness.id);
    if (isSaved) {
      setSavedBusinesses(prev =>
        prev.map(b => b.id === updatedBusiness.id ? updatedBusiness : b)
      );
    }
    setFilteredBusinesses(prev =>
      prev.map(b => b.id === updatedBusiness.id ? updatedBusiness : b)
    );
    loadTrackingData();
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Search Businesses</h1>
          <p>Search for businesses using the backend API</p>
        </div>
      </div>

      <SearchPanel
        onSearchResults={handleSearchResults}
        onLoading={setLoading}
      />

      <BusinessList
        businesses={filteredBusinesses}
        trackingData={trackingData}
        onBusinessUpdated={handleBusinessUpdated}
        onSaveBusiness={handleSaveBusiness}
        savedBusinessIds={new Set(savedBusinesses.map(b => b.id))}
        savedBusinesses={savedBusinesses}
        loading={loading}
        onFilterChange={setFilteredBusinesses}
        allBusinesses={[...savedBusinesses, ...unsavedBusinesses]}
      />

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
}

