# 🚀 PUSH TO GITHUB - COMPLETE GUIDE

## TL;DR

```bash
git push origin main
```

If authentication fails, generate token at: **https://github.com/settings/tokens/new**

---

## Step 1: Generate GitHub Token (If Needed)

### Do You Need a Token?

Try pushing first:
```bash
git push origin main
```

If you see:
- ✅ "Writing objects: 100%" → Success! Skip to Step 3
- ❌ "Authentication failed" → Continue to generate token
- ❌ "Permission denied" → Continue to generate token

### Generate Token

**Direct link**: **https://github.com/settings/tokens/new**

**Settings**:
1. **Note**: `ReflectivAI Deployment Token`
2. **Expiration**: `90 days` (or `No expiration`)
3. **Scopes**: Check `repo` (this checks all sub-items)
4. Click **"Generate token"** (green button at bottom)
5. **COPY THE TOKEN** (starts with `ghp_`) - you'll never see it again!

---

## Step 2: Push with Token

### First Time Push

```bash
git push origin main
```

When prompted:
```
Username: YOUR_GITHUB_USERNAME
Password: PASTE_YOUR_TOKEN_HERE
```

**IMPORTANT**: 
- Username = Your GitHub username (e.g., `johndoe`)
- Password = Your TOKEN (starts with `ghp_`), NOT your GitHub password

### Store Token (Optional)

So you don't have to enter it every time:

**Windows**:
```bash
git config --global credential.helper wincred
```

**Mac**:
```bash
git config --global credential.helper osxkeychain
```

**Linux**:
```bash
git config --global credential.helper cache
```

Then push again - it will remember your token.

---

## Step 3: Verify Push Succeeded

You should see output like:

```
Enumerating objects: 15, done.
Counting objects: 100% (15/15), done.
Delta compression using up to 8 threads
Compressing objects: 100% (10/10), done.
Writing objects: 100% (10/10), 2.5 KiB | 2.5 MiB/s, done.
Total 10 (delta 8), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (8/8), completed with 5 local objects.
To https://github.com/YOUR_USERNAME/YOUR_REPO.git
   abc1234..def5678  main -> main
```

✅ **Success indicators**:
- "Writing objects: 100%"
- "main -> main"
- No error messages

---

## Step 4: Monitor Deployment

### GitHub Actions (2-3 minutes)

1. Go to your repository on GitHub
2. Click **"Actions"** tab
3. Look for **"Deploy to Cloudflare Pages"** workflow
4. Should show yellow dot (in progress) or green checkmark (complete)
5. If red X, click to see error logs

**Direct link format**:
```
https://github.com/YOUR_USERNAME/YOUR_REPO/actions
```

### Cloudflare Pages

1. Go to: https://dash.cloudflare.com/
2. Navigate to: **Workers & Pages** → **reflectivai-app-prod**
3. Verify latest deployment shows **"Success"**
4. Check timestamp matches your push time

---

## Step 5: Test Live Site

### CRITICAL: Use Incognito Mode

**Why?** Your browser has cached the old version. Regular browsing will show old version even after deployment.

### How to Test:

1. **Open incognito window**:
   - **Chrome/Edge**: `Ctrl + Shift + N` (Windows) or `Cmd + Shift + N` (Mac)
   - **Firefox**: `Ctrl + Shift + P` (Windows) or `Cmd + Shift + P` (Mac)
   - **Safari**: `Cmd + Shift + N` (Mac)

2. **Navigate to**:
   ```
   https://reflectivai-app-prod.pages.dev/roleplay
   ```

3. **Hard refresh** (bypass cache):
   - **Windows**: `Ctrl + Shift + R`
   - **Mac**: `Cmd + Shift + R`

4. **Test the changes**:
   - Select a scenario and start roleplay
   - Send 4-5 messages
   - Click "End Session & Get Feedback"
   - Verify dialog shows **3 tabs** (not 4)
   - Verify "Behavioral Metrics" has **expandable cards**
   - Click a card to expand and see coaching insights

---

## Troubleshooting

### "Authentication failed"

**Solution**: Generate token at https://github.com/settings/tokens/new

1. Check `repo` scope
2. Generate token
3. Copy token (starts with `ghp_`)
4. Push again: `git push origin main`
5. Use token as password

### "Permission denied (publickey)"

**Solution**: Switch to HTTPS

```bash
# Check current remote
git remote -v

# If shows git@github.com, switch to HTTPS
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push again
git push origin main
```

### "Updates were rejected"

**Solution**: Pull first

```bash
# Pull latest changes
git pull origin main

# If conflicts, resolve them, then:
git add -A
git commit -m "Resolve conflicts"

# Push again
git push origin main
```

### "Nothing to push"

**Solution**: Changes already pushed or not committed

```bash
# Check status
git status

# If changes exist but not committed:
git add -A
git commit -m "Your commit message"
git push origin main

# If no changes:
# Your repository is up to date!
```

### "GitHub Actions fails"

**Solution**: Check build logs

1. Go to GitHub Actions tab
2. Click failed workflow (red X)
3. Click failed job
4. Read error message
5. Fix errors locally
6. Commit and push again

**Common fixes**:
```bash
# Type check
npm run type-check

# Build locally
npm run build

# If errors, fix them, then:
git add -A
git commit -m "Fix build errors"
git push origin main
```

### "Changes not visible on live site"

**Solution**: Cache issue

1. **Use incognito mode** (most important!)
2. **Hard refresh**: `Ctrl + Shift + R`
3. **Clear browser cache completely**
4. **Wait 5 minutes** for CDN propagation
5. **Try different browser**
6. **Check different device**

---

## Alternative Methods

### Option 1: GitHub Desktop (GUI)

1. Download: https://desktop.github.com/
2. Open repository
3. Review changes
4. Commit to main
5. Click **"Push origin"** button

### Option 2: VS Code

1. Open Source Control panel (`Ctrl + Shift + G`)
2. Review changes
3. Type commit message
4. Click checkmark to commit
5. Click **"..."** menu → **"Push"**

### Option 3: GitHub Web Interface

1. Go to repository on GitHub
2. Click **"Actions"** tab
3. Click **"Deploy to Cloudflare Pages"**
4. Click **"Run workflow"** button
5. Select branch: **main**
6. Click **"Run workflow"**

---

## What Happens After Push

### Automatic Process:

1. **GitHub receives push** (instant)
2. **GitHub Actions triggered** (instant)
3. **Workflow starts**:
   - Checkout code
   - Install dependencies
   - Build application (`npm run build`)
   - Deploy to Cloudflare Pages
4. **Cloudflare receives build** (1-2 minutes)
5. **Cloudflare deploys** (30 seconds)
6. **Live site updated** (instant)

**Total time**: 2-3 minutes

---

## Verification Checklist

After deployment completes:

- [ ] GitHub Actions shows green checkmark
- [ ] Cloudflare Pages shows "Success"
- [ ] Live site loads in incognito mode
- [ ] Feedback dialog shows 3 tabs (not 4)
- [ ] "Behavioral Metrics" has expandable cards
- [ ] Cards expand to show coaching insights
- [ ] Right panel shows metrics during roleplay
- [ ] "End Session" button is visible
- [ ] Page resets when navigating away
- [ ] Console shows debug logs
- [ ] No errors in console

---

## Quick Reference Card

### Generate Token:
**https://github.com/settings/tokens/new**
- Check `repo` scope
- Copy token (starts with `ghp_`)

### Push:
```bash
git push origin main
```
- Username: Your GitHub username
- Password: Your token (not GitHub password)

### Monitor:
- **GitHub Actions**: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
- **Cloudflare**: `https://dash.cloudflare.com/`

### Test:
- **Incognito mode**: `Ctrl + Shift + N`
- **Hard refresh**: `Ctrl + Shift + R`
- **URL**: `https://reflectivai-app-prod.pages.dev/roleplay`

---

## Summary

1. **Generate token** (if needed): https://github.com/settings/tokens/new
2. **Push**: `git push origin main`
3. **Monitor**: GitHub Actions (2-3 min)
4. **Test**: Incognito + hard refresh
5. **Verify**: 3 tabs, expandable cards

---

🚀 **GO PUSH NOW!**

```bash
git push origin main
```
