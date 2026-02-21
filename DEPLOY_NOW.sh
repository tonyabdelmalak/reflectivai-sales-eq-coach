#!/bin/bash

# CRITICAL DEPLOYMENT SCRIPT
# This script pushes all changes to GitHub and triggers Cloudflare deployment

set -e  # Exit on any error

echo "🚀 STARTING DEPLOYMENT PROCESS"
echo "================================"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ ERROR: Not a git repository"
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  WARNING: Not on main branch. Switching to main..."
    git checkout main
fi

# Show current status
echo "\n📊 Git Status:"
git status --short

# Add all changes
echo "\n➕ Adding all changes..."
git add -A

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "\n✅ No changes to commit. Repository is up to date."
    echo "\n🔄 Checking if local is behind remote..."
    git fetch origin main
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/main)
    
    if [ "$LOCAL" = "$REMOTE" ]; then
        echo "✅ Local and remote are in sync."
    else
        echo "⚠️  Local is behind remote. Pulling changes..."
        git pull origin main
    fi
else
    # Commit changes
    echo "\n💾 Committing changes..."
    COMMIT_MSG="CONSOLIDATION: Behavioral Metrics as Source of Truth

CHANGES:
- ✅ Consolidated tabs: Removed Signal Intelligence, merged into Behavioral Metrics
- ✅ Behavioral Metrics uses MetricScoreCard with expand/collapse
- ✅ Wired to real calculations from scoreConversation()
- ✅ Page reset on unmount with cleanup effect
- ✅ Fixed button visibility with overflow-hidden
- ✅ Added debug logging for diagnostics

All changes are frontend-only. Cloudflare worker contract intact."
    
    git commit -m "$COMMIT_MSG"
    echo "✅ Changes committed"
fi

# Push to GitHub
echo "\n🔼 Pushing to GitHub (origin/main)..."
git push origin main

if [ $? -eq 0 ]; then
    echo "\n✅ PUSH SUCCESSFUL!"
    echo "\n🎯 GitHub Actions will now:"
    echo "   1. Build the application"
    echo "   2. Deploy to Cloudflare Pages"
    echo "   3. Make changes live at: https://reflectivai-app-prod.pages.dev"
    echo "\n⏱️  Deployment typically takes 2-3 minutes"
    echo "\n📍 Monitor deployment:"
    echo "   - GitHub Actions: https://github.com/YOUR_USERNAME/YOUR_REPO/actions"
    echo "   - Cloudflare Pages: https://dash.cloudflare.com/"
    echo "\n🧪 After deployment, test in INCOGNITO mode with hard refresh (Ctrl+Shift+R)"
else
    echo "\n❌ PUSH FAILED!"
    echo "\nPossible issues:"
    echo "   1. Authentication required (check GitHub credentials)"
    echo "   2. Remote branch conflicts (try: git pull origin main)"
    echo "   3. Network issues"
    exit 1
fi

echo "\n================================"
echo "✅ DEPLOYMENT INITIATED"
