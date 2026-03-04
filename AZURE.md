# Azure Deployment Guide for SocialBridge

## Prerequisites
- Azure CLI installed
- Docker installed (optional, for container deployment)
- Azure Subscription

## Option 1: Azure App Service (Recommended)

1. **Create Resource Group**
   ```bash
   az group create --name SocialBridgeGroup --location eastus
   ```

2. **Create App Service Plan**
   ```bash
   az appservice plan create --name SocialBridgePlan --resource-group SocialBridgeGroup --sku B1 --is-linux
   ```

3. **Create Web App**
   ```bash
   az webapp create --resource-group SocialBridgeGroup --plan SocialBridgePlan --name social-bridge-app --runtime "NODE:18-lts"
   ```

4. **Configure Environment Variables**
   Set the secrets in Azure Portal -> Configuration -> Application Settings, OR use CLI:
   ```bash
   az webapp config appsettings set --name social-bridge-app --resource-group SocialBridgeGroup --settings DATABASE_URL="..." REDIS_HOST="..." ENCRYPTION_KEY="..."
   ```

5. **Deploy Code**
   Detailed steps for GitHub Actions or Local Git:
   ```bash
   az webapp deployment source config-local-git --name social-bridge-app --resource-group SocialBridgeGroup
   # Push to the provided URL
   ```

## Option 2: Azure Static Web Apps (Hybrid)
Since we have a robust API and Worker, App Service is better. Static Web Apps supports Next.js but backend workers are harder.

## Database (Azure Database for PostgreSQL)
1. **Create Server**
   ```bash
   az postgres flexible-server create --resource-group SocialBridgeGroup --name social-bridge-db --location eastus --admin-user myadmin --admin-password <password> --sku-name Standard_D2s_v3
   ```
2. **Firewall Rule**
   Allow Azure services to access the server.

## Redis (Azure Cache for Redis)
1. **Create Cache**
   ```bash
   az redis create --name social-bridge-redis --resource-group SocialBridgeGroup --location eastus --sku Basic --vm-size c0
   ```

## Background Worker
The worker (`src/worker.ts`) must run as a background process.
In **Azure App Service**, you can use WebJobs or run it alongside via a startup command (e.g., using `pm2`).

**Startup Command:**
```bash
npm install && npx prisma migrate deploy && npm run build && (npm start & npx ts-node src/worker.ts)
```
*Note: For production, compile the worker to JS.*

## Migrations
Run `npx prisma migrate deploy` during the build/deploy pipeline.
