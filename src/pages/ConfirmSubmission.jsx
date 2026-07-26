/**
 * Email confirmation page for web form submissions
 * Handles JWT token verification and submission confirmation
 */

import { useState, useEffect } from 'react';
import styles from './ConfirmSubmission.module.css';

export default function ConfirmSubmission({ token, onClose }) {
  const [status, setStatus] = useState('loading'); // loading, success, error, expired
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No confirmation token provided');
      return;
    }

    confirmSubmission(token);
  }, [token]);

  const confirmSubmission = async (confirmToken) => {
    try {
      const response = await fetch('/api/confirm-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: confirmToken }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.code === 'TOKEN_EXPIRED') {
          setStatus('expired');
          setMessage('Confirmation link has expired (7-day limit)');
          setDetails('Please submit the venue again to receive a new confirmation link.');
        } else if (error.code === 'ALREADY_CONFIRMED') {
          setStatus('success');
          setMessage('✅ This submission was already confirmed!');
          setDetails('Thank you for your patience. Our team will review and publish it soon.');
        } else {
          setStatus('error');
          setMessage('❌ Confirmation failed');
          setDetails(error.message || 'An unexpected error occurred.');
        }
        return;
      }

      const result = await response.json();
      setStatus('success');
      setMessage('✅ Email confirmed! Thank you for your submission.');
      setDetails(
        'Your venue submission has been received and will be reviewed by our team within 1-2 days. ' +
        'Once approved, it will be published to the map. ' +
        'A confirmation email has been sent.'
      );
    } catch (error) {
      setStatus('error');
      setMessage('❌ Network error');
      setDetails('Please check your connection and try again.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === 'loading' && (
          <>
            <div className={styles.spinner}></div>
            <h1>Confirming your submission...</h1>
            <p>Please wait while we verify your email.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className={styles.icon}>✅</div>
            <h1>{message}</h1>
            <p>{details}</p>
            <div className={styles.timeline}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>✓</div>
                <div className={styles.stepText}>Email confirmed</div>
              </div>
              <div className={styles.arrow}>→</div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1-2</div>
                <div className={styles.stepText}>Moderator review</div>
              </div>
              <div className={styles.arrow}>→</div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>24h</div>
                <div className={styles.stepText}>Published to map</div>
              </div>
            </div>
            <button onClick={onClose} className={styles.button}>
              Return to Map
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className={styles.icon}>❌</div>
            <h1>{message}</h1>
            <p>{details}</p>
            <button onClick={onClose} className={styles.button}>
              Try Again
            </button>
          </>
        )}

        {status === 'expired' && (
          <>
            <div className={styles.icon}>⏰</div>
            <h1>{message}</h1>
            <p>{details}</p>
            <button onClick={onClose} className={styles.button}>
              Return to Map & Submit Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
