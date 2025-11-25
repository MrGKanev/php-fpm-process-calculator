# Security Policy

## Supported Versions

We are committed to keeping the PHP-FPM Process Calculator secure. Currently, we support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.2.x   | :white_check_mark: |
| < 1.2   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within the PHP-FPM Process Calculator, please report it responsibly:

### How to Report

1. **DO NOT** open a public GitHub issue for security vulnerabilities
2. Send an email to the maintainer with details about the vulnerability
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
- **Assessment**: We will assess the vulnerability and determine its severity within 7 days
- **Fix**: We will work on a fix and aim to release it as soon as possible
- **Credit**: We will credit you in the release notes (unless you prefer to remain anonymous)

## Security Measures

This project implements several security measures:

- **Content Security Policy (CSP)**: Prevents XSS attacks
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer-Policy**: Controls referrer information
- **Client-side only**: All calculations happen in the browser, no data is sent to servers
- **No tracking**: No analytics or tracking scripts

## Best Practices for Users

When using the PHP-FPM Process Calculator:

- Always review the generated configuration before applying it to production servers
- Test configurations in a staging environment first
- Keep your web server and PHP-FPM up to date
- Follow security best practices when implementing the suggested settings
- Regularly monitor your server's performance and security logs

## Security Updates

Security updates will be:

- Released as soon as a fix is available
- Announced in the project's release notes
- Tagged appropriately in the version control system

## Contact

For security concerns, please contact:
- Maintainer: Gabriel Kanev
- Website: https://gkanev.com
- Repository: https://github.com/MrGKanev/php-fpm-process-calculator

Thank you for helping keep the PHP-FPM Process Calculator and its users safe!
