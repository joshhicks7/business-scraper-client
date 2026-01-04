import { useState } from 'react';
import { X, Phone, Globe, FileText, Calendar } from 'lucide-react';
import './AddEventModal.css';

export default function AddEventModal({ isOpen, onClose, onSave, businessPhone }) {
  const [eventType, setEventType] = useState('call');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState('');
  const [duration, setDuration] = useState('');
  const [progress, setProgress] = useState('');
  const [location, setLocation] = useState('');
  const [attendees, setAttendees] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const eventData = {
      type: eventType,
      title: title.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (eventType === 'call') {
      if (outcome.trim()) {
        eventData.outcome = outcome.trim();
      }
      if (duration.trim()) {
        eventData.duration = parseInt(duration) || undefined;
      }
    } else if (eventType === 'meeting') {
      if (location.trim()) {
        eventData.location = location.trim();
      }
      if (duration.trim()) {
        eventData.duration = parseInt(duration) || undefined;
      }
      if (attendees.trim()) {
        eventData.attendees = attendees.trim();
      }
    } else if (eventType === 'site-progress') {
      if (progress.trim()) {
        eventData.progress = Math.min(100, Math.max(0, parseInt(progress) || 0));
      }
    }

    onSave(eventData);
    handleClose();
  };

  const handleClose = () => {
    setEventType('call');
    setTitle('');
    setNotes('');
    setOutcome('');
    setDuration('');
    setProgress('');
    setLocation('');
    setAttendees('');
    onClose();
  };

  const eventTypes = [
    { value: 'call', label: 'Cold Call', icon: Phone, color: 'var(--primary)' },
    { value: 'meeting', label: 'Meeting', icon: Calendar, color: 'var(--warning)' },
    { value: 'site-progress', label: 'Site Progress', icon: Globe, color: 'var(--success)' },
    { value: 'update', label: 'Update', icon: FileText, color: 'var(--secondary)' },
  ];

  return (
    <div className="add-event-modal-overlay" onClick={handleClose}>
      <div className="add-event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-event-modal-header">
          <h2>Add Timeline Event</h2>
          <button className="add-event-modal-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-event-form">
          <div className="add-event-type-selector">
            <label>Event Type</label>
            <div className="event-type-options">
              {eventTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <label
                    key={type.value}
                    className={`event-type-option ${eventType === type.value ? 'active' : ''}`}
                    style={{
                      '--type-color': type.color
                    }}
                  >
                    <input
                      type="radio"
                      name="eventType"
                      value={type.value}
                      checked={eventType === type.value}
                      onChange={(e) => setEventType(e.target.value)}
                    />
                    <Icon size={18} />
                    <span>{type.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="add-event-field">
            <label htmlFor="title">
              Title {(eventType === 'call' || eventType === 'meeting') && '(optional)'}
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                eventType === 'call' ? 'e.g., Initial outreach call' :
                eventType === 'meeting' ? 'e.g., Initial consultation meeting' :
                'Enter a title'
              }
              required={eventType !== 'call' && eventType !== 'meeting'}
            />
          </div>

          {eventType === 'call' && (
            <>
              <div className="add-event-field">
                <label htmlFor="outcome">Outcome (optional)</label>
                <select
                  id="outcome"
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                >
                  <option value="">Select outcome</option>
                  <option value="No Answer">No Answer</option>
                  <option value="Left Voicemail">Left Voicemail</option>
                  <option value="Spoke - Not Interested">Spoke - Not Interested</option>
                  <option value="Spoke - Interested">Spoke - Interested</option>
                  <option value="Spoke - Follow Up Needed">Spoke - Follow Up Needed</option>
                  <option value="Wrong Number">Wrong Number</option>
                  <option value="Busy">Busy</option>
                </select>
              </div>

              <div className="add-event-field">
                <label htmlFor="duration">Duration (minutes, optional)</label>
                <input
                  id="duration"
                  type="number"
                  min="0"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 5"
                />
              </div>

              {businessPhone && (
                <div className="add-event-phone-hint">
                  <Phone size={16} />
                  <span>Business Phone: <a href={`tel:${businessPhone}`}>{businessPhone}</a></span>
                </div>
              )}
            </>
          )}

          {eventType === 'meeting' && (
            <>
              <div className="add-event-field">
                <label htmlFor="location">Location (optional)</label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Office, Zoom, Phone, etc."
                />
              </div>

              <div className="add-event-field">
                <label htmlFor="duration">Duration (minutes, optional)</label>
                <input
                  id="duration"
                  type="number"
                  min="0"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 30"
                />
              </div>

              <div className="add-event-field">
                <label htmlFor="attendees">Attendees (optional)</label>
                <input
                  id="attendees"
                  type="text"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  placeholder="e.g., John Doe, Jane Smith"
                />
              </div>
            </>
          )}

          {eventType === 'site-progress' && (
            <div className="add-event-field">
              <label htmlFor="progress">Progress Percentage (optional)</label>
              <div className="progress-input-group">
                <input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  placeholder="0-100"
                />
                <span className="progress-percent">%</span>
              </div>
            </div>
          )}

          <div className="add-event-field">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this event..."
              rows={4}
            />
          </div>

          <div className="add-event-actions">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

