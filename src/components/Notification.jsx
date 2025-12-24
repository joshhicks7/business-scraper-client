import { X } from 'lucide-react';
import { useEffect } from 'react';
import './Notification.css';

export default function Notification({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification ${type}`}>
      <span className="notification-message">{message}</span>
      <button className="notification-close" onClick={onClose}>
        <X size={18} />
      </button>
    </div>
  );
}

