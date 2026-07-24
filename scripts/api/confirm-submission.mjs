/**
 * Submission confirmation handler
 * Processes confirmation tokens, marks issues as confirmed, sends thank you email
 *
 * Usage: Called when user clicks confirmation link
 * Token format: JWT with email, issueNumber, expiresIn 7d
 */

import jwt from 'jsonwebtoken';
import { Octokit } from '@octokit/rest';
import { Resend } from 'resend';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function confirmSubmission(token) {
  let decoded;

  // 1. Verify & decode JWT token
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired confirmation link');
  }

  const { email, issueNumber } = decoded;

  if (!email || !issueNumber) {
    throw new Error('Invalid token data');
  }

  try {
    // 2. Update GitHub Issue with confirmation
    const issue = await octokit.issues.get({
      owner: 'Fused-Gaming',
      repo: 'plug',
      issue_number: issueNumber,
    });

    // Check if already confirmed
    if (issue.data.labels.some((label) => label.name === 'email-confirmed')) {
      return {
        success: true,
        already: true,
        message: 'This submission was already confirmed!',
      };
    }

    // Update issue with confirmation labels
    await octokit.issues.update({
      owner: 'Fused-Gaming',
      repo: 'plug',
      issue_number: issueNumber,
      labels: [
        ...issue.data.labels
          .map((label) => label.name)
          .filter((name) => name !== 'pending-confirmation'),
        'email-confirmed',
      ],
    });

    // Add comment to issue with confirmation timestamp
    await octokit.issues.createComment({
      owner: 'Fused-Gaming',
      repo: 'plug',
      issue_number: issueNumber,
      body: `✅ **Email confirmed** by ${email} on ${new Date().toISOString()}

This submission is now ready for moderator review and publication.`,
    });

    console.log(`Confirmed submission #${issueNumber} for ${email}`);

    // 3. Send thank you email
    const emailResult = await resend.emails.send({
      from: 'info@queen.vln.gg',
      to: email,
      subject: '✅ Your Charging Location is Ready for Review',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #059669; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .content { color: #1f2937; line-height: 1.6; }
    .timeline { background: #f0fdf4; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .step { margin: 10px 0; }
    .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
    .footer { color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Email Confirmed!</h1>
    </div>

    <div class="content">
      <p>Thanks for confirming your charging location submission! Here's what happens next:</p>

      <div class="timeline">
        <div class="step">✅ <strong>Email confirmed</strong> - Just now</div>
        <div class="step">🔍 <strong>Moderator review</strong> - 1-2 business days</div>
        <div class="step">📍 <strong>Published to map</strong> - Within 48 hours</div>
        <div class="step">📧 <strong>You'll get another email</strong> when it goes live</div>
      </div>

      <p>We verify all submissions to keep the map accurate and up-to-date. Thank you for helping people find free charging!</p>

      <a href="https://plug.vln.gg" class="button">View the Map</a>
    </div>

    <div class="footer">
      <p>Questions? <a href="https://github.com/Fused-Gaming/plug/issues">Open an issue on GitHub</a></p>
      <p>Charging Station Locator | Helping vulnerable populations stay connected</p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (!emailResult.data) {
      console.warn('Thank you email send had issues but confirmation succeeded');
    }

    return {
      success: true,
      message: 'Submission confirmed! Check your email for next steps.',
    };
  } catch (error) {
    console.error('Confirmation error:', error);
    throw new Error(`Confirmation failed: ${error.message}`);
  }
}

export default confirmSubmission;
