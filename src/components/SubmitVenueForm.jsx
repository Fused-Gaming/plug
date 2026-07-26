/**
 * Web form for community venue submissions
 * Collects location details and user email, sends confirmation link via Resend
 */

import { useState } from 'react';
import styles from './SubmitVenueForm.module.css';

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
      const response = await fetch('/api/submit-venue', {
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
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Suggest a Charging Location</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {status === 'success' ? (
          <div className={styles.successMessage}>{message}</div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.section}>
              <label>
                <span className={styles.required}>*</span> Location Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Downtown Library, Community Center"
                required
              />
            </div>

            <div className={styles.section}>
              <label>
                <span className={styles.required}>*</span> Street Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="e.g., 123 Main St, Oakland, CA 94607"
                required
              />
            </div>

            <div className={styles.section}>
              <label>Neighborhood (optional)</label>
              <input
                type="text"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleInputChange}
                placeholder="e.g., Downtown, Lake Merritt"
              />
            </div>

            <div className={styles.section}>
              <label>
                <span className={styles.required}>*</span> Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.section}>
              <label>Indoor/Outdoor</label>
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
            </div>

            <div className={styles.section}>
              <label>Amenities (optional)</label>
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
            </div>

            <div className={styles.section}>
              <label>Hours of Operation (optional)</label>
              <input
                type="text"
                name="hours"
                value={formData.hours}
                onChange={handleInputChange}
                placeholder="e.g., 9am-5pm Mon-Fri, 10am-3pm Sat"
              />
            </div>

            <div className={styles.section}>
              <label>
                <span className={styles.required}>*</span> Your Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                required
              />
              <small>We'll send you a confirmation link. Your email is never shared.</small>
            </div>

            {status === 'error' && (
              <div className={styles.errorMessage}>{message}</div>
            )}

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
