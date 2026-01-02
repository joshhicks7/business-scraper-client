import { Link, useLocation } from 'react-router-dom';
import { Database, Search, Plus } from 'lucide-react';
import './Layout.css';

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <Link to="/" className="app-title">
            <Database className="icon" />
            Business Scraper
          </Link>
          <nav className="app-nav">
            <Link
              to="/"
              className={`nav-btn ${location.pathname === '/' ? 'active' : ''}`}
            >
              <Database size={20} />
              My Businesses
            </Link>
            <Link
              to="/search"
              className={`nav-btn ${location.pathname === '/search' ? 'active' : ''}`}
            >
              <Search size={20} />
              Search
            </Link>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
}

