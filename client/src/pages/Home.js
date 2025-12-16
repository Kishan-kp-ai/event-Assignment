import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import './Home.css';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (sortBy) params.append('sortBy', sortBy);

      const response = await api.get(`/events?${params.toString()}`);
      setEvents(response.data.events);
      setError(null);
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, startDate, endDate, sortBy]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const clearFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
  };

  const hasFilters = search || startDate || endDate || sortBy !== 'date';

  return (
    <div className="home">
      <header className="home-header">
        <div className="hero-badge">🎉 Discover Amazing Events</div>
        <h1>Find Your Next Experience</h1>
        <p>Join events, meet new people, and create unforgettable memories</p>
      </header>

      <div className="filters-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search events by title, description, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>
              ✕
            </button>
          )}
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <label>From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-input"
            >
              <option value="date">Date (Upcoming)</option>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {hasFilters && (
            <button className="btn btn-secondary clear-filters" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
        </div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>{hasFilters ? 'No events match your search' : 'No upcoming events'}</h3>
          <p>
            {hasFilters
              ? 'Try adjusting your filters or search terms'
              : 'Be the first to create an event and bring people together!'}
          </p>
          {hasFilters ? (
            <button className="btn btn-primary" onClick={clearFilters}>
              Clear Filters
            </button>
          ) : (
            isAuthenticated && (
              <Link to="/create-event" className="btn btn-primary">
                Create Event
              </Link>
            )
          )}
        </div>
      ) : (
        <>
          <div className="section-header">
            <h2>
              {hasFilters ? 'Search Results' : 'Upcoming Events'}
            </h2>
            <span className="event-count">
              {events.length} event{events.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="events-grid">
            {events.map((event, index) => (
              <div key={event._id} style={{ animationDelay: `${index * 0.1}s` }}>
                <EventCard event={event} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
