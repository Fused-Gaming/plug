/**
 * Modal for choosing between web form and GitHub issue submission methods
 */

import styles from './SubmissionMethodChoice.module.css';

export default function SubmissionMethodChoice({ onChooseForm, onChooseIssue, onClose }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>How would you like to suggest a location?</h2>
          <button className={styles.closeBtn} onClick={onClose}>
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
