# 🔑 GitHub Personal Access Token Setup

## Quick Links

### Generate Token:
**👉 https://github.com/settings/tokens/new**

### Or navigate manually:
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"

---

## Step-by-Step Token Generation

### 1. Go to Token Settings

**Direct link**: https://github.com/settings/tokens/new

**Or navigate**:
1. GitHub.com → Click your profile picture (top right)
2. Settings
3. Developer settings (bottom of left sidebar)
4. Personal access tokens → Tokens (classic)
5. Generate new token → Generate new token (classic)

### 2. Configure Token

**Note/Description**: `ReflectivAI Deployment Token`

**Expiration**: 
- Recommended: `90 days` (you'll need to regenerate)
- Or: `No expiration` (less secure but convenient)

**Select scopes** (check these boxes):
- ✅ `repo` (Full control of private repositories)
  - This automatically checks all sub-items:
    - repo:status
    - repo_deployment
    - public_repo
    - repo:invite
    - security_events

**Optional but recommended**:
- ✅ `workflow` (Update GitHub Action workflows)

### 3. Generate Token

1. Scroll to bottom
2. Click **"Generate token"** (green button)
3. **IMPORTANT**: Copy the token immediately!
   - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - You'll NEVER see it again after leaving this page
   - Store it somewhere safe (password manager)

### 4. Use Token for Authentication

#### Option A: HTTPS with Token (Recommended)

When you push, Git will ask for credentials:

```bash
git push origin main

# Username: YOUR_GITHUB_USERNAME
# Password: PASTE_YOUR_TOKEN_HERE (not your GitHub password!)
```

**IMPORTANT**: Use the TOKEN as your password, not your actual GitHub password.

#### Option B: Store Token in Git Credential Manager

**Windows**:
```bash
# Git will prompt once, then remember
git config --global credential.helper wincred
git push origin main
# Enter username and token when prompted
```

**Mac**:
```bash
# Git will prompt once, then remember
git config --global credential.helper osxkeychain
git push origin main
# Enter username and token when prompted
```

**Linux**:
```bash
# Cache credentials for 1 hour
git config --global credential.helper 'cache --timeout=3600'
git push origin main
# Enter username and token when prompted
```

#### Option C: Embed Token in Remote URL (Less Secure)

```bash
# Set remote URL with token embedded
git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/YOUR_REPO.git

# Now push without prompts
git push origin main
```

⚠️ **Warning**: This stores your token in plain text in `.git/config`. Only use on your personal machine.

---

## Token Scopes Explained

### Required Scopes:

**`repo`** - Full control of private repositories
- Allows pushing code
- Allows triggering workflows
- Allows reading/writing repository data

### Optional Scopes:

**`workflow`** - Update GitHub Action workflows
- Allows modifying `.github/workflows/` files
- Useful if you need to update deployment workflows

**`read:org`** - Read org and team membership
- Only needed if repository is in an organization

---

## Troubleshooting

### "Authentication failed"

**Cause**: Wrong token or token expired

**Solution**:
1. Generate new token: https://github.com/settings/tokens/new
2. Copy the new token
3. Try push again with new token

### "Token doesn't have required scopes"

**Cause**: Token missing `repo` scope

**Solution**:
1. Go to: https://github.com/settings/tokens
2. Click on your token
3. Check the `repo` scope
4. Click "Update token"
5. Try push again

### "Token not accepted"

**Cause**: Using GitHub password instead of token

**Solution**:
- GitHub no longer accepts passwords for Git operations
- You MUST use a Personal Access Token
- Generate one at: https://github.com/settings/tokens/new

### "remote: Invalid username or password"

**Cause**: 
- Using GitHub password (not supported anymore)
- Token expired
- Wrong token

**Solution**:
1. Generate fresh token: https://github.com/settings/tokens/new
2. Use token as password (not your GitHub password)
3. Username is your GitHub username

---

## Security Best Practices

### DO:
- ✅ Store token in password manager
- ✅ Use credential manager to cache token
- ✅ Set expiration date (90 days recommended)
- ✅ Regenerate token if compromised
- ✅ Use minimum required scopes

### DON'T:
- ❌ Share token with anyone
- ❌ Commit token to repository
- ❌ Post token in public forums
- ❌ Use same token for multiple projects (if possible)
- ❌ Store token in plain text files

---

## Alternative: SSH Key Authentication

If you prefer SSH over HTTPS:

### 1. Generate SSH Key

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter to accept default location
# Enter passphrase (optional but recommended)
```

### 2. Copy Public Key

**Mac/Linux**:
```bash
cat ~/.ssh/id_ed25519.pub
```

**Windows**:
```bash
type %USERPROFILE%\.ssh\id_ed25519.pub
```

### 3. Add to GitHub

1. Go to: https://github.com/settings/keys
2. Click "New SSH key"
3. Title: `My Computer`
4. Paste public key
5. Click "Add SSH key"

### 4. Change Remote URL

```bash
# Check current URL
git remote -v

# Change to SSH
git remote set-url origin git@github.com:YOUR_USERNAME/YOUR_REPO.git

# Test connection
ssh -T git@github.com
# Should see: "Hi USERNAME! You've successfully authenticated..."

# Push
git push origin main
```

---

## Quick Reference

### Generate Token:
**https://github.com/settings/tokens/new**

### Required Settings:
- **Note**: `ReflectivAI Deployment`
- **Expiration**: `90 days`
- **Scopes**: `repo` (checked)

### Use Token:
```bash
git push origin main
# Username: YOUR_GITHUB_USERNAME
# Password: YOUR_TOKEN (starts with ghp_)
```

### Store Token:
```bash
# Windows
git config --global credential.helper wincred

# Mac
git config --global credential.helper osxkeychain

# Linux
git config --global credential.helper cache
```

---

## After Getting Token

### 1. Test Authentication

```bash
# Try pushing
git push origin main

# When prompted:
# Username: YOUR_GITHUB_USERNAME
# Password: PASTE_YOUR_TOKEN
```

### 2. Verify Push Succeeded

```bash
# Should see:
# Enumerating objects: X, done.
# Counting objects: 100% (X/X), done.
# Writing objects: 100% (X/X), done.
# To https://github.com/YOUR_USERNAME/YOUR_REPO.git
#    abc1234..def5678  main -> main
```

### 3. Monitor Deployment

1. **GitHub Actions**: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
2. **Cloudflare Pages**: https://dash.cloudflare.com/
3. Wait 2-3 minutes
4. Test in incognito: https://reflectivai-app-prod.pages.dev/roleplay

---

## Summary

1. **Generate token**: https://github.com/settings/tokens/new
2. **Check `repo` scope**
3. **Copy token** (starts with `ghp_`)
4. **Push**: `git push origin main`
5. **Use token as password** when prompted
6. **Monitor deployment** in GitHub Actions
7. **Test in incognito** mode

---

🔑 **GO GENERATE YOUR TOKEN NOW**: https://github.com/settings/tokens/new
