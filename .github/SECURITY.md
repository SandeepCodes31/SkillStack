# Security Policy for SkillStack LMS

## Supported Versions

SkillStack actively maintains security patches for the main production branch.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x (main) | :white_check_mark: |
| < 1.0.0 | :x:                |

---

## Reporting a Vulnerability

The SkillStack engineering team takes security issues seriously. If you discover a vulnerability or security flaw, please report it responsibly so that we can investigate and resolve it before public disclosure.

### How to Report

1. **Email Directly**: Send details of the potential vulnerability to **sandeeppal6926@gmail.com**.
2. **Private Vulnerability Reporting**: You can also submit an advisory via the **[GitHub Security Advisories](https://github.com/SandeepCodes31/SkillStack/security/advisories/new)** tab.

### Please Include:
- A description of the issue and potential impact
- Detailed steps to reproduce the vulnerability (or proof-of-concept script/request payload)
- Any relevant logs, screenshots, or code pointers
- Suggested mitigation steps if known

---

## Response Timeline & Disclosure

- **Acknowledgment**: Within **24 to 48 hours** of receiving your report.
- **Assessment & Triage**: Our team will verify the report and determine severity.
- **Fix & Deployment**: Security patches are tested and deployed promptly.
- **Public Disclosure**: We coordinate responsible public disclosure once the fix is deployed and verified.

---

## Security Practices & Architecture

SkillStack implements defense-in-depth security:
- **Authentication**: Stateless HMAC-SHA256 JWT tokens with role-based authorization (Admin / Instructor / Student).
- **Injection Protection**: Express 5 compatible NoSQL sanitization layer protecting MongoDB queries.
- **Rate Limiting**: IP-based rate limiting on sensitive authentication routes (`/login`, `/register`).
- **HTTP Hardening**: Strict-Transport-Security (HSTS), X-Content-Type-Options (`nosniff`), X-Frame-Options (`DENY`), and Referrer-Policy headers.
- **Secrets Management**: Credentials and API keys are isolated via environment variables and never exposed in client bundles.
