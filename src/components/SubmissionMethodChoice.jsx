/**
 * Modal for choosing between web form and GitHub issue submission methods
 */

import { useEffect, useRef } from 'react';
import styles from './SubmissionMethodChoice.module.css';

export default function SubmissionMethodChoice({ onChooseForm, onChooseIssue, onClose }) {
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
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
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

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="submission-choice-heading"
      >
        <div className={styles.header}>
          <h2 id="submission-choice-heading">How would you like to suggest a location?</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            ref={closeBtnRef}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.optionCard}>
            <div className={styles.optionIcon}>📋</div>
            <h3>Quick Web Form</h3>
            <p>Easy-to-fill form with email confirmation. Perfect for most users.</p>
            <ul>
              <li>✓ Faster to fill out</li>
              <li>✓ Email confirmation ensures quality</li>
              <li>✓ Mobile-friendly</li>
            </ul>
            <button className={styles.optionBtn} onClick={onChooseForm}>
              Use Web Form
            </button>
          </div>

          <div className={styles.divider}>or</div>

          <div className={styles.optionCard}>
            <div className={styles.optionIcon}>💻</div>
            <h3>GitHub Issue</h3>
            <p>For technical users who want to contribute directly to the project.</p>
            <ul>
              <li>✓ Full version control history</li>
              <li>✓ Direct GitHub integration</li>
              <li>✓ Public discussion thread</li>
            </ul>
            <button className={styles.optionBtn} onClick={onChooseIssue}>
              Create GitHub Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
