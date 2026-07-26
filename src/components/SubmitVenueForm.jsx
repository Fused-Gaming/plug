/**
 * Web form for community venue submissions
 * Collects location details and user email, sends confirmation link via Resend
 *
 * The submission endpoint is configurable via the VITE_SUBMIT_ENDPOINT env var so this
 * component can point at a real serverless verification function in production while
 * still falling back to the Vite dev-only middleware (vite.middleware.js +
 * scripts/api/submit-venue.mjs) for local development. Set VITE_SUBMIT_ENDPOINT in
 * .env / .env.production once the backend URL is provisioned (see issue #42).
 */

import { useState, useRef, useEffect } from 'react';
import styles from './SubmitVenueForm.module.css';

const SUBMIT_ENDPOINT = import.meta.env.VITE_SUBMIT_ENDPOINT || '/api/submit-venue';

export default function SubmitVenueForm({ onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    neighborhood: '',
    category: 'library',
    indoor: true,
    access: 'public',
    amenities: [],
    hours: '',
    email: '',
  });

  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  // Focus management: move focus into the modal on open, trap it while open,
  // and restore focus to whatever triggered the modal on close (Esc or overlay click).
  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement;
    closeBtnRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedRef.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = [
    { value: 'library', label: '📚 Library' },
    { value: 'community_centre', label: '🏛️ Community Center' },
    { value: 'device_charging_station', label: '⚡ Charging Station' },
    { value: 'cafe', label: '☕ Café' },
    { value: 'hotel', label: '🏨 Hotel' },
    { value: 'other', label: '📍 Other' },
  ];

  const amenityOptions = [
    { value: 'Wi-Fi', label: '📡 Wi-Fi' },
    { value: 'Seating', label: '🪑 Seating' },
    { value: 'Food', label: '🍽️ Food/Drinks' },
    { value: 'Restrooms', label: '🚻 Restrooms' },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch(SUBMIT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      const result = await response.json();
      setStatus('success');
      setMessage('✅ Check your email for a confirmation link!');
      setFormData({
        name: '',
        address: '',
        neighborhood: '',
        category: 'library',
        indoor: true,
        access: 'public',
        amenities: [],
        hours: '',
        email: '',
      });

      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(`❌ ${error.message}. Please try again.`);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-venue-heading"
      >
        <div className={styles.header}>
          <h2 id="submit-venue-heading">Suggest a Charging Location</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            ref={closeBtnRef}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {status === 'success' ? (
          <div className={styles.successMessage} role="status" aria-live="polite">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.section}>
              <label htmlFor="submit-venue-name">
                <span className={styles.required} aria-hidden="true">*</span> Location Name
              </label>
              <input
                id="submit-venue-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Downtown Library, Community Center"
                required
                aria-required="true"
              />
            </div>

            <div className={styles.section}>
              <label htmlFor="submit-venue-address">
                <span className={styles.required} aria-hidden="true">*</span> Street Address
              </label>
              <input
                id="submit-venue-address"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="e.g., 123 Main St, Oakland, CA 94607"
                required
                aria-required="true"
              />
            </div>

            <div className={styles.section}>
              <label htmlFor="submit-venue-neighborhood">Neighborhood (optional)</label>
              <input
                id="submit-venue-neighborhood"
                type="text"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleInputChange}
                placeholder="e.g., Downtown, Lake Merritt"
              />
            </div>

            <div className={styles.section}>
              <label htmlFor="submit-venue-category">
                <span className={styles.required} aria-hidden="true">*</span> Category
              </label>
              <select
                id="submit-venue-category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                aria-required="true"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <fieldset className={styles.section}>
              <legend>Indoor/Outdoor</legend>
              <div className={styles.radioGroup}>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    name="indoor"
                    value="true"
                    checked={formData.indoor === true}
                    onChange={() => setFormData((prev) => ({ ...prev, indoor: true }))}
                  />
                  🏠 Indoor
                </label>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    name="indoor"
                    value="false"
                    checked={formData.indoor === false}
                    onChange={() => setFormData((prev) => ({ ...prev, indoor: false }))}
                  />
                  🌳 Outdoor
                </label>
              </div>
            </fieldset>

            <fieldset className={styles.section}>
              <legend>Amenities (optional)</legend>
              <div className={styles.checkboxGroup}>
                {amenityOptions.map((amenity) => (
                  <label key={amenity.value} className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity.value)}
                      onChange={() => handleAmenityToggle(amenity.value)}
                    />
                    {amenity.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className={styles.section}>
              <label htmlFor="submit-venue-hours">Hours of Operation (optional)</label>
              <input
                id="submit-venue-hours"
                type="text"
                name="hours"
                value={formData.hours}
                onChange={handleInputChange}
                placeholder="e.g., 9am-5pm Mon-Fri, 10am-3pm Sat"
              />
            </div>

            <div className={styles.section}>
              <label htmlFor="submit-venue-email">
                <span className={styles.required} aria-hidden="true">*</span> Your Email
              </label>
              <input
                id="submit-venue-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                required
                aria-required="true"
                aria-describedby="submit-venue-email-hint"
              />
              <small id="submit-venue-email-hint">
                We'll send you a confirmation link. Your email is never shared.
              </small>
            </div>

            {status === 'error' && (
              <div className={styles.errorMessage} role="alert" aria-live="assertive">
                {message}
              </div>
            )}

            <div className={styles.visuallyHidden} role="status" aria-live="polite">
              {status === 'loading' ? 'Sending your submission…' : ''}
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === 'loading'}
                className={styles.submitBtn}
              >
                {status === 'loading' ? '⏳ Sending...' : '📤 Send Confirmation Email'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
