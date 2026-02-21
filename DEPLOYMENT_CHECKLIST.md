# DEPLOYMENT CHECKLIST

## Current Status
**Date**: 2026-02-01
**Changes**: Tab consolidation, MetricScoreCard integration, page reset, button visibility fix
**Branch**: main
**Target**: https://reflectivai-app-prod.pages.dev

## Pre-Deployment

- [ ] All changes committed locally
- [ ] Type check passes: `npm run type-check`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in dev mode

## Deployment Steps

### Option 1: Automated Script (Recommended)
```bash
chmod +x DEPLOY_NOW.sh
./DEPLOY_NOW.sh
```

### Option 2: Manual Commands
```bash
# 1. Check status
git status

# 2. Add all changes
git add -A

# 3. Commit
git commit -m "CONSOLIDATION: Behavioral Metrics as Source of Truth"

# 4. Push to GitHub
git push origin main
```

### Option 3: GitHub Web Interface
1. Go to your GitHub repository
2. Navigate to Actions tab
3. Click "Deploy to Cloudflare Pages"
4. Click "Run workflow" button
5. Select branch: main
6. Click "Run workflow"

## Post-Deployment Verification

### 1. Check GitHub Actions
- [ ] Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
- [ ] Verify "Deploy to Cloudflare Pages" workflow is running
- [ ] Wait for green checkmark (2-3 minutes)
- [ ] Check logs if red X appears

### 2. Check Cloudflare Pages
- [ ] Go to: https://dash.cloudflare.com/
- [ ] Navigate to Workers & Pages → reflectivai-app-prod
- [ ] Verify latest deployment shows "Success"
- [ ] Check deployment timestamp matches push time

### 3. Test Live Site (CRITICAL)

**MUST USE INCOGNITO MODE + HARD REFRESH**

```bash
# Chrome/Edge
Ctrl+Shift+N (incognito)
Ctrl+Shift+R (hard refresh)

# Firefox
Ctrl+Shift+P (private window)
Ctrl+Shift+R (hard refresh)
```

#### Test Checklist
- [ ] Navigate to: https://reflectivai-app-prod.pages.dev/roleplay
- [ ] Select a scenario and start roleplay
- [ ] Send 4-5 messages
- [ ] Check console for:
  - `🔍 getMetricScore(...)` logs
  - `📡 SignalIntelligencePanel Props` log
  - No errors or warnings
- [ ] Verify right panel shows "Behavioral Metrics" with scores
- [ ] Click "End Session & Get Feedback"
- [ ] Verify dialog shows 3 tabs (not 4):
  1. Behavioral Metrics (expandable cards)
  2. Examples
  3. Growth
- [ ] Click any metric card to expand
- [ ] Verify shows: definition, scoring method, indicators, coaching
- [ ] Navigate to /dashboard
- [ ] Return to /roleplay
- [ ] Verify page reset (scenario grid, not previous conversation)
- [ ] Check console for: `🧹 Roleplay page unmounting - cleaning up state`

## Troubleshooting

### Issue: Changes not visible on live site

**Cause**: Browser cache or CDN cache

**Solution**:
1. **ALWAYS use incognito mode** for testing
2. **Hard refresh** (Ctrl+Shift+R)
3. Clear browser cache completely
4. Wait 5 minutes for CDN propagation
5. Check different browser

### Issue: GitHub Actions fails

**Check**:
1. Build logs in Actions tab
2. TypeScript errors: `npm run type-check`
3. Build errors: `npm run build`
4. Dependencies: `npm install`

**Common fixes**:
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Type check
npm run type-check

# Build locally
npm run build
```

### Issue: Cloudflare deployment fails

**Check**:
1. Cloudflare API token in GitHub Secrets
2. Account ID in GitHub Secrets
3. Project name matches: `reflectivai-app-prod`
4. Wrangler version compatibility

**Verify secrets**:
- Go to: GitHub repo → Settings → Secrets and variables → Actions
- Check exists:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`

### Issue: Push rejected

**Cause**: Local behind remote or conflicts

**Solution**:
```bash
# Pull latest
git pull origin main

# If conflicts, resolve and commit
git add -A
git commit -m "Resolve conflicts"

# Push again
git push origin main
```

## Rollback Plan

If deployment breaks production:

```bash
# Option 1: Revert last commit
git revert HEAD
git push origin main

# Option 2: Reset to previous commit
git reset --hard 53060e23
git push origin main --force

# Option 3: Cloudflare rollback
# Go to Cloudflare Pages dashboard
# Find previous successful deployment
# Click "Rollback to this deployment"
```

## Success Criteria

- ✅ GitHub Actions shows green checkmark
- ✅ Cloudflare Pages shows "Success" status
- ✅ Live site loads without errors
- ✅ Feedback dialog shows 3 tabs (not 4)
- ✅ Behavioral Metrics tab has expandable cards
- ✅ Metrics show real scores (varied, not all same)
- ✅ Right panel shows metrics during roleplay
- ✅ End Session button visible
- ✅ Page resets when navigating away
- ✅ Console shows debug logs
- ✅ No Cloudflare worker errors

## Files Changed in This Deployment

1. `src/components/roleplay-feedback-dialog.tsx`
   - Removed "Signal Intelligence" tab
   - Enhanced "Behavioral Metrics" with MetricScoreCard
   - Wired to real metricResults

2. `src/pages/roleplay.tsx`
   - Added cleanup effect on unmount
   - Fixed overflow for button visibility
   - Added debug logging

3. `CONSOLIDATION_COMPLETE.md`
   - Comprehensive documentation

4. `DEPLOY_NOW.sh`
   - Automated deployment script

5. `DEPLOYMENT_CHECKLIST.md`
   - This file

## Contact

If deployment fails after following all steps:
1. Capture console output
2. Capture GitHub Actions logs
3. Capture Cloudflare Pages logs
4. Screenshot of error messages
5. Provide all to support

---

**CRITICAL**: Always test in incognito mode with hard refresh. Browser cache WILL show old version.
