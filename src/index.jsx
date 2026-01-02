import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA
// Only register on http:// or https:// protocols (not file://)
if ('serviceWorker' in navigator && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('New service worker available');
            }
          });
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
  
  // Handle service worker updates - auto-reload when new version is ready
  // Disabled during development to prevent reload loops
  // Uncomment and use in production if you want automatic updates
  /*
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        // Only reload if there's a waiting service worker (actual update scenario)
        if (registration.waiting) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  });
  */
  
  // Dev helper: Clear all Service Worker caches
  // Usage: clearSWCaches() in console
  window.clearSWCaches = function() {
    if (!navigator.serviceWorker.controller) {
      console.log('No active service worker found');
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          console.log('✓ All Service Worker caches cleared');
          resolve();
        } else {
          console.error('Failed to clear caches');
          reject(new Error('Failed to clear caches'));
        }
      };
      
      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_CACHES' },
        [messageChannel.port2]
      );
    });
  };
  
  // Dev helper: Force service worker to skip waiting and activate
  // Usage: forceSWUpdate() in console
  window.forceSWUpdate = function() {
    if (!navigator.serviceWorker.controller) {
      console.log('No active service worker found');
      return;
    }
    
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    console.log('Service worker skip waiting requested');
  };
}

