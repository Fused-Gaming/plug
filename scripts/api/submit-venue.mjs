/**
 * Venue submission handler
 * Receives form data, creates GitHub Issue, sends Resend confirmation email
 *
 * Usage: Called from form submission endpoint
 * Environment: GITHUB_TOKEN, RESEND_API_KEY, JWT_SECRET
 */

import { Octokit } from '@octokit/rest';
import { Resend } from 'resend';
import jwt from 'jsonwebtoken';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitVenue(formData) {
  const {
    name,
    address,
    neighborhood,
    category,
    indoor,
    access,
    amenities,
    hours,
    email,
  } = formData;

  // Validate required fields
  if (!name || !address || !category || !email) {
    throw new Error('Missing required fields');
  }

  // Sanitize email
  const sanitizedEmail = email.toLowerCase().trim();

  try {
    // 1. Create GitHub Issue for submission record
    const issueTitle = `[WEB-FORM] ${name} - ${sanitizedEmail}`;
    const issueBody = `
## Venue Submission via Web Form

**Submitted:** ${new Date().toISOString()}
**Email:** ${sanitizedEmail}

### Location Details
- **Name:** ${name}
- **Address:** ${address}
- **Neighborhood:** ${neighborhood || '(not provided)'}
- **Category:** ${category}
- **Indoor/Outdoor:** ${indoor ? 'Indoor' : 'Outdoor'}
- **Access:** ${access}
- **Amenities:** ${amenities.length > 0 ? amenities.join(', ') : 'None'}
- **Hours:** ${hours || '(not provided)'}

### Status
- [ ] Email Confirmed
- [ ] Verified by Moderator
- [ ] Published to Map

---
*This issue tracks the community submission. User will receive email confirmation link.*
`;

    const issue = await octokit.issues.create({
      owner: 'Fused-Gaming',
      repo: 'plug',
      title: issueTitle,
      body: issueBody,
      labels: ['community-submission', 'web-form', 'pending-confirmation'],
    });

    console.log(`Created GitHub Issue #${issue.data.number}`);

    // 2. Generate JWT confirmation token
    const confirmationToken = jwt.sign(
      {
        email: sanitizedEmail,
        issueNumber: issue.data.number,
        venueId: `sub/${Date.now()}`, // Temporary ID
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 3. Send Resend confirmation email
    const confirmationUrl = `https://plug.vln.gg/confirm?token=${confirmationToken}`;

    const emailResult = await resend.emails.send({
      from: 'confirm@queen.vln.gg',
      to: sanitizedEmail,
      subject: `Confirm: ${name} Charging Location`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .content { color: #1f2937; line-height: 1.6; }
    .venue { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
    .footer { color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Confirm Your Charging Location</h1>
    </div>

    <div class="content">
      <p>Thanks for suggesting <strong>${name}</strong>!</p>

      <div class="venue">
        <strong>${name}</strong><br>
        📍 ${address}<br>
        ${neighborhood ? `🏘️ ${neighborhood}<br>` : ''}
        ${hours ? `⏰ ${hours}<br>` : ''}
        ${amenities.length > 0 ? `✨ ${amenities.join(', ')}<br>` : ''}
      </div>

      <p>Click the link below to confirm this submission. Your email helps us verify that you're the location's contact.</p>

      <a href="${confirmationUrl}" class="button">Confirm Submission</a>

      <p><small>Or copy this link: <code>${confirmationUrl}</code></small></p>

      <p>This link expires in 7 days. If you didn't submit this, just ignore this email.</p>
    </div>

    <div class="footer">
      <p>Charging Station Locator | Privacy-first mapping of free charging stations</p>
      <p>Your email is stored securely and used only for confirmation. <a href="https://plug.vln.gg">View our privacy policy</a></p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (!emailResult.data) {
      throw new Error('Failed to send confirmation email');
    }

    console.log(`Sent confirmation email to ${sanitizedEmail}`);

    return {
      success: true,
      issueNumber: issue.data.number,
      message: 'Confirmation email sent. Please check your inbox!',
    };
  } catch (error) {
    console.error('Submission error:', error);
    throw new Error(`Submission failed: ${error.message}`);
  }
}

// Export for use in serverless/API context
export default submitVenue;
