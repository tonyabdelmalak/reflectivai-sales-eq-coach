# 🚀 DEPLOY CHANGES TO PRODUCTION

## TL;DR - DO THIS NOW:

```bash
git push origin main
```

Then wait 2-3 minutes and test in **incognito mode** at:
https://reflectivai-app-prod.pages.dev/roleplay

---

## Why Changes Aren't Visible

**Your changes are committed locally but NOT pushed to GitHub.**

The live site (https://reflectivai-app-prod.pages.dev) deploys from your **GitHub repository**, not your local machine.

### Current State:
- ✅ Changes made in code
- ✅ Changes committed locally (commit: 90a8e3d)
- ❌ Changes NOT pushed to GitHub
- ❌ Live site still shows old version

### What You Need to Do:
1. Push to GitHub: `git push origin main`
2. GitHub Actions automatically builds and deploys
3. Live site updates in 2-3 minutes

---

## Step-by-Step Deployment

### 1. Open Terminal

**Windows**:
- Press `Win + R`
- Type `cmd`
- Press Enter

**Mac**:
- Press `Cmd + Space`
- Type `terminal`
- Press Enter

**Linux**:
- Press `Ctrl + Alt + T`

### 2. Navigate to Your Project

```bash
cd /path/to/your/reflectivai/project
```

Replace `/path/to/your/reflectivai/project` with the actual path where your code is.

### 3. Push to GitHub

```bash
git push origin main
```

This single command:
- Uploads your local commits to GitHub
- Triggers GitHub Actions workflow
- Builds the application
- Deploys to Cloudflare Pages
- Updates the live site

### 4. Monitor Deployment

**GitHub Actions** (check build status):
1. Go to your GitHub repository
2. Click "Actions" tab
3. Look for "Deploy to Cloudflare Pages" workflow
4. Wait for green checkmark ✅ (2-3 minutes)
5. If red X ❌, click to see error logs

**Cloudflare Pages** (check deployment):
1. Go to: https://dash.cloudflare.com/
2. Navigate to: Workers & Pages → reflectivai-app-prod
3. Verify latest deployment shows "Success"
4. Check timestamp matches your push time

### 5. Test Live Site

**CRITICAL**: You MUST use incognito mode + hard refresh

**Why?** Your browser has cached the old version. Regular browsing will show old version even after deployment.

**How to test properly**:

1. **Open incognito window**:
   - Chrome/Edge: `Ctrl + Shift + N` (Windows) or `Cmd + Shift + N` (Mac)
   - Firefox: `Ctrl + Shift + P` (Windows) or `Cmd + Shift + P` (Mac)

2. **Navigate to**:
   ```
   https://reflectivai-app-prod.pages.dev/roleplay
   ```

3. **Hard refresh**:
   - `Ctrl + Shift + R` (Windows)
   - `Cmd + Shift + R` (Mac)

4. **Test the changes**:
   - Start a roleplay scenario
   - Send 4-5 messages
   - Click "End Session & Get Feedback"
   - Verify dialog shows **3 tabs** (not 4)
   - Verify "Behavioral Metrics" tab has **expandable cards**
   - Click a card to expand and see coaching insights

---

## What Changed in This Deployment

### 1. Tab Consolidation
- **Before**: 4 tabs (Behavioral Metrics, Signal Intelligence, Examples, Growth)
- **After**: 3 tabs (Behavioral Metrics, Examples, Growth)
- **Why**: Signal Intelligence was redundant, derived from Behavioral Metrics

### 2. Enhanced Behavioral Metrics
- **Before**: Simple cards with just scores
- **After**: Expandable MetricScoreCard components
- **Features**:
  - Click to expand/collapse
  - Shows definition
  - Shows scoring method
  - Shows observable indicators
  - Shows coaching insights

### 3. Real Calculations
- **Before**: Mock data or fallback scores
- **After**: Wired directly to `scoreConversation()` function
- **Result**: Real-time scoring based on actual conversation

### 4. Page Reset
- **Before**: Page state persisted when navigating away
- **After**: Cleanup effect clears all state on unmount
- **Result**: Fresh start when returning to /roleplay

### 5. Button Visibility
- **Before**: "End Session" button sometimes cut off on desktop
- **After**: Added `overflow-hidden` to parent container
- **Result**: Button always visible

### 6. Debug Logging
- **Added**: Console logs for diagnostics
- **Purpose**: Verify metric calculations and state updates
- **Logs**:
  - `🔍 getMetricScore(...)` - Metric lookup results
  - `📡 SignalIntelligencePanel Props` - Right panel data
  - `🧹 Roleplay page unmounting` - Cleanup confirmation

---

## Troubleshooting

### "Permission denied (publickey)"

**Problem**: GitHub authentication failed

**Solution**: Switch to HTTPS authentication

```bash
# Check current remote URL
git remote -v

# If it shows git@github.com, switch to HTTPS
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Try push again
git push origin main
```

### "Updates were rejected"

**Problem**: Your local branch is behind the remote

**Solution**: Pull latest changes first

```bash
# Pull from GitHub
git pull origin main

# If conflicts, resolve them in your editor, then:
git add -A
git commit -m "Resolve conflicts"

# Push again
git push origin main
```

### "GitHub Actions build fails"

**Problem**: Code has errors that prevent building

**Solution**: Check and fix errors locally

```bash
# Check for TypeScript errors
npm run type-check

# Try building locally
npm run build

# If errors appear, fix them, then:
git add -A
git commit -m "Fix build errors"
git push origin main
```

### "Changes still not visible after deployment"

**Problem**: Browser cache or CDN cache

**Solution**:
1. **Use incognito mode** (most important)
2. **Hard refresh** (Ctrl+Shift+R)
3. **Clear browser cache completely**
4. **Wait 5 minutes** for CDN propagation
5. **Try different browser**
6. **Check different device** (phone, tablet)

---

## Alternative Deployment Methods

### Option 1: GitHub Desktop (GUI)

If you prefer a graphical interface:

1. Download: https://desktop.github.com/
2. Open your repository in GitHub Desktop
3. Review changes in left sidebar
4. Click "Commit to main"
5. Click "Push origin" (top right)
6. Monitor deployment in GitHub Actions

### Option 2: VS Code (If You Use It)

If you're using VS Code:

1. Open Source Control panel (Ctrl+Shift+G)
2. Review changes
3. Type commit message
4. Click checkmark to commit
5. Click "..." menu → "Push"
6. Monitor deployment in GitHub Actions

### Option 3: GitHub Web Interface

Manually trigger deployment:

1. Go to your GitHub repository
2. Click "Actions" tab
3. Click "Deploy to Cloudflare Pages" workflow
4. Click "Run workflow" button
5. Select branch: main
6. Click "Run workflow"

---

## Files Modified

### Core Changes:
1. **src/components/roleplay-feedback-dialog.tsx**
   - Removed "Signal Intelligence" tab
   - Enhanced "Behavioral Metrics" with MetricScoreCard
   - Wired to real metricResults prop

2. **src/pages/roleplay.tsx**
   - Added cleanup effect on unmount
   - Fixed overflow for button visibility
   - Added debug logging

### Documentation:
3. **CONSOLIDATION_COMPLETE.md** - Comprehensive change documentation
4. **DEPLOY_NOW.sh** - Automated deployment script
5. **DEPLOYMENT_CHECKLIST.md** - Detailed deployment guide
6. **URGENT_DEPLOY_INSTRUCTIONS.md** - Emergency deployment instructions
7. **README_DEPLOY_NOW.md** - This file

---

## Verification Checklist

After deployment, verify these in incognito mode:

- [ ] Live site loads without errors
- [ ] Feedback dialog shows **3 tabs** (not 4)
- [ ] No "Signal Intelligence" tab
- [ ] "Behavioral Metrics" tab has **expandable cards**
- [ ] Clicking a card shows:
  - [ ] Definition
  - [ ] Scoring method
  - [ ] Observable indicators
  - [ ] Coaching insights
- [ ] Right panel shows "Behavioral Metrics" during roleplay
- [ ] Metrics show **varied scores** (not all same)
- [ ] "End Session" button is **visible** on desktop
- [ ] Page **resets** when navigating away and returning
- [ ] Console shows debug logs:
  - [ ] `🔍 getMetricScore(...)` logs
  - [ ] `📡 SignalIntelligencePanel Props` log
  - [ ] `🧹 Roleplay page unmounting` log
- [ ] No console errors
- [ ] No Cloudflare worker errors

---

## Summary

### The Problem:
Changes are committed locally but not pushed to GitHub.

### The Solution:
```bash
git push origin main
```

### The Result:
Live site updates in 2-3 minutes.

### The Test:
Incognito mode + hard refresh at https://reflectivai-app-prod.pages.dev/roleplay

---

## Need Help?

If you're stuck after trying everything:

1. **Screenshot** the error you're seeing
2. **Copy** the full error message from terminal
3. **Check** GitHub Actions logs for build errors
4. **Provide**:
   - Operating system (Windows/Mac/Linux)
   - Git version: `git --version`
   - Node version: `node --version`
   - Error message
   - Screenshot

---

# 🚀 GO DEPLOY NOW!

**One command to rule them all**:

```bash
git push origin main
```

**Then test in incognito mode with hard refresh.**

**That's it. Everything else is automatic.**
