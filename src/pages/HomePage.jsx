import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import BusinessList from '../components/BusinessList';
import CreateBusinessModal from '../components/CreateBusinessModal';
import Notification from '../components/Notification';
import { getAllBusinesses, getAllTrackingData } from '../services/firebaseService';

export default function HomePage() {
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [trackingData, setTrackingData] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBusinesses();
    loadTrackingData();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const data = await getAllBusinesses();
      setBusinesses(data);
      setFilteredBusinesses(data);
    } catch (error) {
      showNotification('Failed to load businesses', 'error');
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
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

  const handleBusinessCreated = (business) => {
    setBusinesses(prev => [business, ...prev]);
    setFilteredBusinesses(prev => [business, ...prev]);
    setShowCreateModal(false);
      showNotification('Business created successfully!', 'success');
    loadBusinesses(); // Reload to get the business ID
  };

  const handleBusinessUpdated = (updatedBusiness) => {
    setBusinesses(prev =>
      prev.map(b => b.id === updatedBusiness.id ? updatedBusiness : b)
    );
    setFilteredBusinesses(prev =>
      prev.map(b => b.id === updatedBusiness.id ? updatedBusiness : b)
    );
    loadTrackingData();
  };

  const handleBusinessDeleted = (businessId) => {
    setBusinesses(prev => prev.filter(b => b.id !== businessId));
    setFilteredBusinesses(prev => prev.filter(b => b.id !== businessId));
    showNotification('Business deleted successfully', 'success');
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>My Businesses</h1>
          <p>Manage your saved businesses</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={20} />
          Add Business
        </button>
      </div>

      <BusinessList
        businesses={filteredBusinesses}
        trackingData={trackingData}
        onBusinessUpdated={handleBusinessUpdated}
        onBusinessDeleted={handleBusinessDeleted}
        savedBusinessIds={new Set(businesses.map(b => b.id))}
        savedBusinesses={businesses}
        loading={loading}
        onFilterChange={setFilteredBusinesses}
        allBusinesses={businesses}
      />

      {showCreateModal && (
        <CreateBusinessModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleBusinessCreated}
        />
      )}

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

