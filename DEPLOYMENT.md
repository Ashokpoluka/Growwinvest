# Groww Inventory Deployment Guide

This document outlines the strategy for deploying the Groww Inventory System to production.

## 1. Local Production Parity
To verify the production stack locally:
```bash
docker-compose up --build
```

## 2. Environment Variables
Ensure the following variables are set in your production environment:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | MySQL Connection String |
| `JWT_SECRET` | Secret key for token generation |
| `VAPID_PUBLIC_KEY` | Public key for Push Notifications |
| `VAPID_PRIVATE_KEY` | Private key for Push Notifications |
| `SMTP_HOST` | Email server host |
| `SMTP_USER` | Email username |
| `SMTP_PASS` | Email password |

## 3. CI/CD Pipeline
The system is equipped with GitHub Actions (`.github/workflows/deploy.yml`) which:
- Validates builds for both Client and Server.
- Runs Prisma generation.
- (Optional) Publishes Docker images to a container registry.

## 4. Scalability
The application is containerized, making it compatible with:
- **AWS ECS/EKS**
- **Google Cloud Run**
- **DigitalOcean App Platform**

## 5. Security Checklist
- [ ] Change `MYSQL_ROOT_PASSWORD` in `docker-compose.yml`.
- [ ] Enable SSL/TLS for the database connection.
- [ ] Use a production-grade Nginx configuration if not using a cloud load balancer.
