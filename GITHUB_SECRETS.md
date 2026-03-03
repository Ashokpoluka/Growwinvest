# GitHub Secrets Configuration Guide

To enable full CI/CD deployment for the Groww Inventory System, you need to add your production secrets to GitHub.

## Step 1: Create an Environment
1. Go to your GitHub repository: [Growwinvest](https://github.com/Ashokpoluka/Growwinvest).
2. Click **Settings** > **Environments**.
3. Click **New environment** and name it `production`.

## Step 2: Add Environment Secrets
Inside the `production` environment, add the following secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DATABASE_URL` | Your production MySQL connection string | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | A secure random string for tokens | `your_ultra_secure_secret` |
| `GEMINI_API_KEY` | Your Google AI API Key | `AIzaSy...` |
| `EMAIL_USER` | SMTP username for alerts | `system@yourdomain.com` |
| `EMAIL_PASS` | SMTP password | `********` |

## Step 3: Trigger Deployment
Once these are added, every time you **push** to the `main` branch, GitHub Actions will:
1. Verify the code.
2. Build the production Docker images.
3. (Optional) Deploy to your chosen cloud provider.
