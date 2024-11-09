# Decap CMS OAuth Provider

A Cloudflare Workers-based OAuth provider that enables GitHub authentication for Decap CMS (formerly Netlify CMS). This service acts as a secure bridge between your static site's content management system and GitHub's authentication services.

## Overview

When using Decap CMS with GitHub, you need an OAuth authentication service to handle the login process securely. This provider:

1. Facilitates the OAuth handshake between Decap CMS and GitHub
2. Manages authentication tokens securely
3. Enables content editors to log in to your CMS using their GitHub accounts
4. Runs on Cloudflare's edge network for optimal performance

This solution is particularly useful for static sites using Decap CMS where you want to:
- Enable multiple content editors to collaborate
- Maintain secure authentication workflows
- Deploy a serverless authentication service with minimal maintenance
- Take advantage of Cloudflare's global edge network

## Prerequisites

- Cloudflare account
- GitHub account
- A registered GitHub OAuth application
- Wrangler CLI installed (`npm install -g wrangler`)

## Setup

### 1. GitHub Configuration

1. Go to GitHub Developer Settings > OAuth Apps > New OAuth App
2. Fill in the application details:
   - Application name: `Your Site CMS`
   - Homepage URL: `https://your-site.com`
   - Authorization callback URL: `https://your-worker.workers.dev/callback`
3. Note down the Client ID and generate a Client Secret

### 2. Cloudflare Configuration

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables in a `.dev.vars` file:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```
4. Deploy to Cloudflare Workers:
   ```bash
   wrangler deploy
   ```

### 3. Decap CMS Configuration

Update your Decap CMS config (usually in `admin/config.yml`):

```yaml
backend:
  name: github
  repo: username/repo
  base_url: https://your-worker.workers.dev
```

## Development

To run locally:

```bash
wrangler dev
```

## Architecture

This service uses Cloudflare Workers to:
- Handle OAuth authentication flow
- Securely manage tokens
- Provide fast, globally distributed authentication
- Minimize cold starts and latency

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.