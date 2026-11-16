# Security Policy

## Supported Versions

Vantray is under active development. Security fixes are provided only for the latest release and the current `main` branch.

| Version        | Supported |
| -------------- | --------- |
| Latest release | ✅        |
| `main`         | ✅        |
| Older releases | ❌        |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Use one of the private channels:

1. **GitHub Private Vulnerability Reporting**: open the repository's **Security** tab → **Report a vulnerability**.

Please include:

- a description of the vulnerability and its potential impact;
- the affected component (API, subscriptions, dashboard, CLI, Xray integration, Telegram/Discord bots, etc.) and version or commit;
- step-by-step instructions to reproduce, with a proof of concept if possible;
- your environment (OS, Python version, Docker or bare metal, database);
- any suggested fix or mitigation.

### What to expect

- **Acknowledgement** within 72 hours.
- **Initial assessment** within 7 days.
- Regular updates on progress until the issue is resolved.
- Credit in the release notes if you wish, once a fix is published.

We ask that you give us a reasonable time to fix the issue before public disclosure (coordinated disclosure, up to 90 days).

## Scope

In scope:

- authentication and authorization flaws in the API (admin, user, node, subscription endpoints);
- JWT / token handling, password storage, secret leakage;
- injection (SQL, command, template), SSRF, path traversal, XSS/CSRF in the dashboard;
- exposure of user data, subscription links, or Xray keys;
- insecure defaults in `Dockerfile`, `docker-compose.yml`, `install_service.sh`.

Out of scope:

- vulnerabilities in third-party software (Xray-core, sing-box, Clash, etc.), which should be reported to their maintainers;
- issues requiring physical access or an already compromised server;
- denial of service via excessive resource use without a practical amplification vector;
- misconfiguration of your own deployment (see the checklist below);
- social engineering and spam.

## Deployment Hardening Checklist

- Never commit `.env`, `db.sqlite3`, `xray_config.json`, or any file with keys, tokens, or user data.
- Set a strong `SUDO_PASSWORD` / admin credentials; don't use defaults.
- Run the panel behind HTTPS (reverse proxy or built-in TLS) and don't expose it without it.
- Restrict access to the dashboard and API (firewall, VPN, IP allowlist) where possible.
- Keep Xray-core, Python dependencies, and the Docker image up to date.
- Protect Telegram/Discord bot tokens and webhook URLs; rotate them if leaked.
- Back up the database and store backups encrypted.
- Use a separate non-root user for running the service.

## Safe Harbor

We will not pursue legal action against researchers who act in good faith: they test only their own instances, avoid privacy violations and data destruction, don't disrupt services of other users, and follow this policy.
