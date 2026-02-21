# 🔐 GITHUB SECRETS REQUIRED FOR AUTO-DEPLOY

**Status:** Workflow exists ✅ | Secrets missing ❌  
**Issue:** GitHub Actions cannot deploy to Cloudflare without API credentials

---

## 🎯 WHAT YOU NEED TO DO

### Step 1: Get Cloudflare API Token

1. Go to: **https://dash.cloudflare.com/profile/api-tokens**
2. Click: **"Create Token"**
3. Use template: **"Edit Cloudflare Workers"**
4. **Copy the token** (you'll only see it once!)

### Step 2: Get Cloudflare Account ID

1. Go to: **https://dash.cloudflare.com/**
2. Click on **Workers & Pages** (or any site)
3. Look in the **right sidebar** for "Account ID"
4. **Copy the Account ID**

### Step 3: Add Secrets to GitHub

1. Go to: **https://github.com/ReflectivEI/dev_projects_full-build2/settings/secrets/actions**
2. Click: **"New repository secret"**
3. **Add first secret:**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: [paste your API token from Step 1]
   - Click "Add secret"
4. **Add second secret:**
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: [paste your Account ID from Step 2]
   - Click "Add secret"

---

## 🚀 AFTER ADDING SECRETS

**Every push to main will automatically deploy to Cloudflare!**

To trigger deployment immediately:

1. Go to: **https://github.com/ReflectivEI/dev_projects_full-build2/actions**
2. Click: **"Deploy to Cloudflare Pages"** (left sidebar)
3. Click: **"Run workflow"** button (right side)
4. Select branch: **main**
5. Click: **"Run workflow"** (green button)

---

## ✅ VERIFY DEPLOYMENT

1. **GitHub Actions:** https://github.com/ReflectivEI/dev_projects_full-build2/actions
   - Look for green checkmark on "Deploy to Cloudflare Pages"

2. **Cloudflare Dashboard:** https://dash.cloudflare.com/
   - Navigate to: Workers & Pages → reflectivai-app-prod → Deployments
   - Look for recent deployment with matching commit hash

3. **Production Site:** https://reflectivai-app-prod.pages.dev/
   - Test roleplay functionality
   - Verify HCP cue detection works correctly

---

## 📊 WORKFLOW DETAILS

**File:** `.github/workflows/deploy-to-cloudflare.yml`

**Triggers:**
- ✅ Push to `main` branch (automatic)
- ✅ Manual workflow dispatch (via GitHub UI)

**Required Secrets:**
- `CLOUDFLARE_API_TOKEN` - API token from Cloudflare
- `CLOUDFLARE_ACCOUNT_ID` - Account ID from Cloudflare

---

## 🔗 QUICK LINKS

- **Get API Token:** https://dash.cloudflare.com/profile/api-tokens
- **Get Account ID:** https://dash.cloudflare.com/ (right sidebar)
- **Add Secrets:** https://github.com/ReflectivEI/dev_projects_full-build2/settings/secrets/actions
- **Trigger Deploy:** https://github.com/ReflectivEI/dev_projects_full-build2/actions

---

**Once secrets are added, auto-deploy will work on every push to main!**
