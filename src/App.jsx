import { useState, useEffect } from 'react';
import { Search, Plus, Database, Settings } from 'lucide-react';
import SearchPanel from './components/SearchPanel';
import BusinessList from './components/BusinessList';
import BusinessModal from './components/BusinessModal';
import CreateBusinessModal from './components/CreateBusinessModal';
import Notification from './components/Notification';
import { getAllBusinesses, getAllTrackingData } from './services/firebaseService';
import './App.css';

function App() {
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [trackingData, setTrackingData] = useState({});
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');

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

  const handleSearchResults = (results) => {
    const businessesWithIds = results.map((b, index) => ({
      ...b,
      id: `search-${Date.now()}-${index}`,
      source: 'osm'
    }));
    setBusinesses(businessesWithIds);
    setFilteredBusinesses(businessesWithIds);
    showNotification(`Found ${results.length} businesses!`, 'success');
  };

  const handleBusinessCreated = (business) => {
    setBusinesses(prev => [business, ...prev]);
    setFilteredBusinesses(prev => [business, ...prev]);
    setShowCreateModal(false);
    showNotification('Business created successfully!', 'success');
    loadBusinesses(); // Reload to get Firebase ID
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
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1 className="app-title">
            <Database className="icon" />
            Business Scraper
          </h1>
          <nav className="app-nav">
            <button
              className={`nav-btn ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              <Search size={20} />
              Search
            </button>
            <button
              className={`nav-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <Database size={20} />
              All Businesses
            </button>
            <button
              className="nav-btn primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={20} />
              Add Business
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {activeTab === 'search' && (
            <SearchPanel
              onSearchResults={handleSearchResults}
              onLoading={setLoading}
            />
          )}

          <BusinessList
            businesses={filteredBusinesses}
            trackingData={trackingData}
            onBusinessClick={setSelectedBusiness}
            onBusinessUpdated={handleBusinessUpdated}
            onBusinessDeleted={handleBusinessDeleted}
            loading={loading}
            onFilterChange={setFilteredBusinesses}
            allBusinesses={businesses}
          />
        </div>
      </main>

      {selectedBusiness && (
        <BusinessModal
          business={selectedBusiness}
          trackingData={trackingData[selectedBusiness.id]}
          onClose={() => setSelectedBusiness(null)}
          onUpdate={handleBusinessUpdated}
          onDelete={handleBusinessDeleted}
        />
      )}

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
    </div>
  );
}

export default App;

