# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this bootcamp demo project, please email the project maintainers directly instead of using the issue tracker. Do not publicly disclose the vulnerability until it has been addressed.

**Email:** [your-email@example.com]

Please include:
1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact

## Scope

Since this is a bootcamp demo project with limited scope, we focus on:
- Preventing common OWASP Top 10 vulnerabilities in the core feature
- Secure handling of user input
- No storage of sensitive credentials in code

## Known Limitations

This is a time-constrained submission focused on demonstrating core functionality. As such:

- No OAuth/complex auth systems
- Minimal external API integration
- No production database setup
- Limited third-party dependencies

For a production deployment, a full security audit would be required.

## Development Guidelines

When coding for this project:

- ❌ Never commit credentials, API keys, or secrets
- ❌ Don't hardcode sensitive data
- ✅ Sanitize user input
- ✅ Use environment variables for configuration
- ✅ Follow framework security best practices
- ✅ Keep dependencies up to date

## Questions?

If you have security questions about this project, reach out to the maintainers directly.
