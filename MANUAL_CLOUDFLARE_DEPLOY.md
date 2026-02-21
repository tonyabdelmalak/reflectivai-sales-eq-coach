# Manual Cloudflare Deployment Instructions

## Problem
GitHub Actions Cloudflare deployment is failing. The build succeeds but Wrangler deployment fails.

## Solution: Deploy Manually from Local Machine

### Prerequisites
1. Node.js 20+ installed
2. Wrangler CLI installed globally: `npm install -g wrangler@3`
3. Cloudflare account credentials

### Steps

#### 1. Clone Repository
```bash
git clone https://github.com/ReflectivEI/dev_projects_full-build2.git
cd dev_projects_full-build2
```

#### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

#### 3. Build Application
```bash
npm run build
```

#### 4. Authenticate with Cloudflare
```bash
wrangler login
```
This will open a browser window to authenticate.

Or use API token:
```bash
export CLOUDFLARE_API_TOKEN="rQSEvfDkypQIm31Zwu68_Zhk6yCgy4Qp_IQMUlNB"
export CLOUDFLARE_ACCOUNT_ID="59fea97fab54fbd4d4168ccaa1fa3410"
```

#### 5. Deploy to Cloudflare Pages
```bash
wrangler pages deploy dist/client \
  --project-name=reflectivai-app-prod \
  --branch=main
```

### Expected Output
```
✨ Success! Uploaded 1 files (X.XX sec)

✨ Deployment complete! Take a peek over at
   https://reflectivai-app-prod.pages.dev
```

### Troubleshooting

**Error: "Project not found"**
- Create project first in Cloudflare dashboard
- Or use: `wrangler pages project create reflectivai-app-prod`

**Error: "Authentication failed"**
- Run `wrangler login` again
- Or verify API token has correct permissions

**Error: "Account ID not found"**
- Verify account ID: `wrangler whoami`
- Check Cloudflare dashboard for correct account ID

### Alternative: Direct Upload via Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com
2. Navigate to: Workers & Pages → Pages
3. Select project: `reflectivai-app-prod`
4. Click "Create deployment"
5. Upload the `dist/client` folder
6. Click "Save and Deploy"

## Why GitHub Actions is Failing

Possible reasons:
1. API token permissions insufficient
2. Account ID mismatch
3. Project name doesn't exist
4. Wrangler version incompatibility

The manual deployment bypasses GitHub Actions and deploys directly from your local machine.
