import { Phone, Globe, FileText, Trash2, Calendar } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import './Timeline.css';

export default function Timeline({ events, onDeleteEvent, canDelete = true }) {
  if (!events || events.length === 0) {
    return (
      <div className="timeline-empty">
        <p>No timeline events yet. Add your first event to start tracking!</p>
      </div>
    );
  }

  const getEventIcon = (type) => {
    switch (type) {
      case 'call':
        return <Phone size={18} />;
      case 'meeting':
        return <Calendar size={18} />;
      case 'site-progress':
        return <Globe size={18} />;
      case 'update':
        return <FileText size={18} />;
      default:
        return <FileText size={18} />;
    }
  };

  const getEventTypeLabel = (type) => {
    switch (type) {
      case 'call':
        return 'Cold Call';
      case 'meeting':
        return 'Meeting';
      case 'site-progress':
        return 'Site Progress';
      case 'update':
        return 'Update';
      default:
        return 'Event';
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'call':
        return 'var(--primary)';
      case 'meeting':
        return 'var(--warning)';
      case 'site-progress':
        return 'var(--success)';
      case 'update':
        return 'var(--secondary)';
      default:
        return 'var(--text-muted)';
    }
  };

  return (
    <div className="timeline">
      {events.map((event, index) => {
        const eventDate = event.createdAt?.toDate ? event.createdAt.toDate() : new Date(event.createdAt);
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="timeline-item">
            <div className="timeline-line" style={{ backgroundColor: getEventColor(event.type) }} />
            <div className="timeline-content">
              <div className="timeline-header">
                <div className="timeline-icon" style={{ backgroundColor: getEventColor(event.type) }}>
                  {getEventIcon(event.type)}
                </div>
                <div className="timeline-meta">
                  <div className="timeline-type">{getEventTypeLabel(event.type)}</div>
                  <div className="timeline-date">
                    {format(eventDate, 'MMM d, yyyy h:mm a')}
                    <span className="timeline-relative"> • {formatDistanceToNow(eventDate, { addSuffix: true })}</span>
                  </div>
                </div>
                {canDelete && (
                  <button
                    className="timeline-delete-btn"
                    onClick={() => onDeleteEvent(event.id)}
                    title="Delete event"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              
              {event.title && (
                <div className="timeline-title">{event.title}</div>
              )}

              {event.type === 'call' && (
                <div className="timeline-call-details">
                  {event.outcome && (
                    <div className="timeline-badge" style={{ backgroundColor: getEventColor(event.type) + '20', color: getEventColor(event.type) }}>
                      Outcome: {event.outcome}
                    </div>
                  )}
                  {event.duration && (
                    <div className="timeline-badge" style={{ backgroundColor: getEventColor(event.type) + '20', color: getEventColor(event.type) }}>
                      Duration: {event.duration} min
                    </div>
                  )}
                </div>
              )}

              {event.type === 'meeting' && (
                <div className="timeline-call-details">
                  {event.location && (
                    <div className="timeline-badge" style={{ backgroundColor: getEventColor(event.type) + '20', color: getEventColor(event.type) }}>
                      Location: {event.location}
                    </div>
                  )}
                  {event.duration && (
                    <div className="timeline-badge" style={{ backgroundColor: getEventColor(event.type) + '20', color: getEventColor(event.type) }}>
                      Duration: {event.duration} min
                    </div>
                  )}
                  {event.attendees && (
                    <div className="timeline-badge" style={{ backgroundColor: getEventColor(event.type) + '20', color: getEventColor(event.type) }}>
                      Attendees: {event.attendees}
                    </div>
                  )}
                </div>
              )}

              {event.type === 'site-progress' && event.progress && (
                <div className="timeline-progress">
                  <div className="timeline-progress-label">Progress: {event.progress}%</div>
                  <div className="timeline-progress-bar">
                    <div 
                      className="timeline-progress-fill" 
                      style={{ 
                        width: `${event.progress}%`,
                        backgroundColor: getEventColor(event.type)
                      }}
                    />
                  </div>
                </div>
              )}

              {event.notes && (
                <div className="timeline-notes">{event.notes}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

