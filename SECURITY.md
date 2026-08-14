# Security Policy

## Supported Versions

The latest released version of LLM API Sentinel receives security updates.
We follow [Semantic Versioning](https://semver.org/) and track the current
version in `package.json`.

| Version | Supported          |
| ------- | ------------------ |
| 2.7.x   | :white_check_mark: |
| < 2.7   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report them privately using one of the following channels:

- **GitHub Private Vulnerability Reporting**: use the "Report a vulnerability"
  button under the **Security** tab of this repository.
- **Email**: send details to the maintainers (see `package.json` `author` field
  or the repository's security contact).

Please include the following in your report:

- A description of the vulnerability and its impact
- Steps to reproduce or a proof-of-concept
- Affected version(s)
- Any suggested remediation, if known

We will acknowledge receipt within **3 business days** and aim to provide a
remediation timeline within **7 business days**. Once fixed, we will coordinate
disclosure with you and credit the reporter (unless anonymity is requested).

## Security Best Practices

For the project's threat model, data protection, and deployment hardening
guidance, see:

- [docs/security.md](docs/security.md) — security architecture and best practices
- [security_best_practices_report.md](security_best_practices_report.md) — detailed audit report
