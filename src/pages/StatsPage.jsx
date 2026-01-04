import { useState, useEffect } from 'react';
import { BarChart3, Phone, Globe, Building2, TrendingUp, Calendar } from 'lucide-react';
import { getAllBusinesses, getAllTimelineEvents } from '../services/firebaseService';
import { format, formatDistanceToNow } from 'date-fns';
import Notification from '../components/Notification';
import './StatsPage.css';

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalCalls: 0,
    totalMeetings: 0,
    callsByOutcome: {},
    totalSiteProgress: 0,
    averageProgress: 0,
    totalWebsites: 0,
    totalDemos: 0,
    recentCalls: [],
    recentMeetings: [],
    recentProgress: [],
    callsThisWeek: 0,
    callsThisMonth: 0,
    meetingsThisWeek: 0,
    meetingsThisMonth: 0,
  });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all businesses and timeline events
      const [businesses, events] = await Promise.all([
        getAllBusinesses(),
        getAllTimelineEvents()
      ]);

      // Calculate statistics
      const callEvents = events.filter(e => e.type === 'call');
      const meetingEvents = events.filter(e => e.type === 'meeting');
      const progressEvents = events.filter(e => e.type === 'site-progress');
      const updateEvents = events.filter(e => e.type === 'update');

      // Calls by outcome
      const callsByOutcome = {};
      callEvents.forEach(call => {
        const outcome = call.outcome || 'Unknown';
        callsByOutcome[outcome] = (callsByOutcome[outcome] || 0) + 1;
      });

      // Calculate average progress
      const progressValues = progressEvents
        .map(e => e.progress)
        .filter(p => p !== undefined && p !== null);
      const averageProgress = progressValues.length > 0
        ? Math.round(progressValues.reduce((a, b) => a + b, 0) / progressValues.length)
        : 0;

      // Count websites and demos
      let totalWebsites = 0;
      let totalDemos = 0;
      businesses.forEach(business => {
        if (business.websites) {
          totalWebsites += Array.isArray(business.websites) ? business.websites.length : 1;
        } else if (business.website) {
          totalWebsites += 1;
        }
        if (business.demos) {
          totalDemos += Array.isArray(business.demos) ? business.demos.length : 1;
        } else if (business.our_website) {
          totalDemos += 1;
        }
      });

      // Recent calls (last 10)
      const recentCalls = callEvents
        .slice(0, 10)
        .map(call => {
          const business = businesses.find(b => b.id === call.businessId);
          return {
            ...call,
            businessName: business?.name || 'Unknown Business',
            date: call.createdAt?.toDate ? call.createdAt.toDate() : new Date(call.createdAt)
          };
        });

      // Recent meetings (last 10)
      const recentMeetings = meetingEvents
        .slice(0, 10)
        .map(meeting => {
          const business = businesses.find(b => b.id === meeting.businessId);
          return {
            ...meeting,
            businessName: business?.name || 'Unknown Business',
            date: meeting.createdAt?.toDate ? meeting.createdAt.toDate() : new Date(meeting.createdAt)
          };
        });

      // Recent progress (last 10)
      const recentProgress = progressEvents
        .slice(0, 10)
        .map(progress => {
          const business = businesses.find(b => b.id === progress.businessId);
          return {
            ...progress,
            businessName: business?.name || 'Unknown Business',
            date: progress.createdAt?.toDate ? progress.createdAt.toDate() : new Date(progress.createdAt)
          };
        });

      // Calls and meetings this week and month
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const callsThisWeek = callEvents.filter(call => {
        const callDate = call.createdAt?.toDate ? call.createdAt.toDate() : new Date(call.createdAt);
        return callDate >= weekAgo;
      }).length;

      const callsThisMonth = callEvents.filter(call => {
        const callDate = call.createdAt?.toDate ? call.createdAt.toDate() : new Date(call.createdAt);
        return callDate >= monthAgo;
      }).length;

      const meetingsThisWeek = meetingEvents.filter(meeting => {
        const meetingDate = meeting.createdAt?.toDate ? meeting.createdAt.toDate() : new Date(meeting.createdAt);
        return meetingDate >= weekAgo;
      }).length;

      const meetingsThisMonth = meetingEvents.filter(meeting => {
        const meetingDate = meeting.createdAt?.toDate ? meeting.createdAt.toDate() : new Date(meeting.createdAt);
        return meetingDate >= monthAgo;
      }).length;

      setStats({
        totalBusinesses: businesses.length,
        totalCalls: callEvents.length,
        totalMeetings: meetingEvents.length,
        callsByOutcome,
        totalSiteProgress: progressEvents.length,
        averageProgress,
        totalWebsites,
        totalDemos,
        recentCalls,
        recentMeetings,
        recentProgress,
        callsThisWeek,
        callsThisMonth,
        meetingsThisWeek,
        meetingsThisMonth,
        totalUpdates: updateEvents.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      showNotification('Failed to load statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return (
      <div className="stats-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  const outcomeLabels = {
    'No Answer': 'No Answer',
    'Left Voicemail': 'Voicemail',
    'Spoke - Not Interested': 'Not Interested',
    'Spoke - Interested': 'Interested',
    'Spoke - Follow Up Needed': 'Follow Up',
    'Wrong Number': 'Wrong Number',
    'Busy': 'Busy',
    'Unknown': 'Unknown'
  };

  return (
    <div className="stats-page">
      <div className="stats-header">
        <h1>Statistics Dashboard</h1>
        <button className="btn btn-secondary" onClick={loadStats}>
          Refresh
        </button>
      </div>

      <div className="stats-grid">
        {/* Total Businesses */}
        <div className="stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: 'var(--primary)' }}>
            <Building2 size={24} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-label">Total Businesses</div>
            <div className="stat-card-value">{stats.totalBusinesses}</div>
          </div>
        </div>

        {/* Total Calls */}
        <div className="stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: 'var(--primary)' }}>
            <Phone size={24} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-label">Total Cold Calls</div>
            <div className="stat-card-value">{stats.totalCalls}</div>
            <div className="stat-card-subtext">
              {stats.callsThisWeek} this week • {stats.callsThisMonth} this month
            </div>
          </div>
        </div>

        {/* Total Meetings */}
        <div className="stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: 'var(--warning)' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-label">Total Meetings</div>
            <div className="stat-card-value">{stats.totalMeetings}</div>
            <div className="stat-card-subtext">
              {stats.meetingsThisWeek} this week • {stats.meetingsThisMonth} this month
            </div>
          </div>
        </div>

        {/* Site Progress Events */}
        <div className="stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: 'var(--success)' }}>
            <Globe size={24} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-label">Site Progress Updates</div>
            <div className="stat-card-value">{stats.totalSiteProgress}</div>
            {stats.averageProgress > 0 && (
              <div className="stat-card-subtext">
                Average: {stats.averageProgress}%
              </div>
            )}
          </div>
        </div>

        {/* Total Websites */}
        <div className="stat-card">
          <div className="stat-card-icon" style={{ backgroundColor: 'var(--secondary)' }}>
            <Globe size={24} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-label">Websites Created</div>
            <div className="stat-card-value">{stats.totalWebsites}</div>
            <div className="stat-card-subtext">
              {stats.totalDemos} demos
            </div>
          </div>
        </div>
      </div>

      {/* Calls by Outcome */}
      {Object.keys(stats.callsByOutcome).length > 0 && (
        <div className="stats-section">
          <h2 className="stats-section-title">
            <BarChart3 size={20} />
            Call Outcomes
          </h2>
          <div className="outcome-grid">
            {Object.entries(stats.callsByOutcome)
              .sort((a, b) => b[1] - a[1])
              .map(([outcome, count]) => (
                <div key={outcome} className="outcome-card">
                  <div className="outcome-label">{outcomeLabels[outcome] || outcome}</div>
                  <div className="outcome-count">{count}</div>
                  <div className="outcome-bar">
                    <div
                      className="outcome-bar-fill"
                      style={{
                        width: `${(count / stats.totalCalls) * 100}%`,
                        backgroundColor: outcome === 'Spoke - Interested' || outcome === 'Spoke - Follow Up Needed'
                          ? 'var(--success)'
                          : outcome === 'Spoke - Not Interested'
                          ? 'var(--error)'
                          : 'var(--primary)'
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="stats-section-grid">
        {/* Recent Calls */}
        {stats.recentCalls.length > 0 && (
          <div className="stats-section">
            <h2 className="stats-section-title">
              <Phone size={20} />
              Recent Calls
            </h2>
            <div className="activity-list">
              {stats.recentCalls.map((call, index) => (
                <div key={call.id || index} className="activity-item">
                  <div className="activity-icon" style={{ backgroundColor: 'var(--primary)' }}>
                    <Phone size={16} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{call.businessName}</div>
                    <div className="activity-details">
                      {call.outcome && (
                        <span className="activity-badge">{call.outcome}</span>
                      )}
                      {call.duration && (
                        <span className="activity-meta">{call.duration} min</span>
                      )}
                    </div>
                    {call.notes && (
                      <div className="activity-notes">{call.notes}</div>
                    )}
                    <div className="activity-time">
                      {format(call.date, 'MMM d, yyyy h:mm a')} • {formatDistanceToNow(call.date, { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Meetings */}
        {stats.recentMeetings.length > 0 && (
          <div className="stats-section">
            <h2 className="stats-section-title">
              <Calendar size={20} />
              Recent Meetings
            </h2>
            <div className="activity-list">
              {stats.recentMeetings.map((meeting, index) => (
                <div key={meeting.id || index} className="activity-item">
                  <div className="activity-icon" style={{ backgroundColor: 'var(--warning)' }}>
                    <Calendar size={16} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{meeting.businessName}</div>
                    {meeting.title && (
                      <div className="activity-subtitle">{meeting.title}</div>
                    )}
                    <div className="activity-details">
                      {meeting.location && (
                        <span className="activity-badge" style={{ backgroundColor: 'var(--warning)', color: 'white' }}>
                          {meeting.location}
                        </span>
                      )}
                      {meeting.duration && (
                        <span className="activity-meta">{meeting.duration} min</span>
                      )}
                      {meeting.attendees && (
                        <span className="activity-meta">Attendees: {meeting.attendees}</span>
                      )}
                    </div>
                    {meeting.notes && (
                      <div className="activity-notes">{meeting.notes}</div>
                    )}
                    <div className="activity-time">
                      {format(meeting.date, 'MMM d, yyyy h:mm a')} • {formatDistanceToNow(meeting.date, { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Progress */}
        {stats.recentProgress.length > 0 && (
          <div className="stats-section">
            <h2 className="stats-section-title">
              <TrendingUp size={20} />
              Recent Site Progress
            </h2>
            <div className="activity-list">
              {stats.recentProgress.map((progress, index) => (
                <div key={progress.id || index} className="activity-item">
                  <div className="activity-icon" style={{ backgroundColor: 'var(--success)' }}>
                    <Globe size={16} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{progress.businessName}</div>
                    {progress.title && (
                      <div className="activity-subtitle">{progress.title}</div>
                    )}
                    {progress.progress !== undefined && (
                      <div className="activity-progress">
                        <div className="activity-progress-label">Progress: {progress.progress}%</div>
                        <div className="activity-progress-bar">
                          <div
                            className="activity-progress-fill"
                            style={{ width: `${progress.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {progress.notes && (
                      <div className="activity-notes">{progress.notes}</div>
                    )}
                    <div className="activity-time">
                      {format(progress.date, 'MMM d, yyyy h:mm a')} • {formatDistanceToNow(progress.date, { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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

