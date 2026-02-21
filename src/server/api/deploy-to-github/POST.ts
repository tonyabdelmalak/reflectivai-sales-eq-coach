import type { Request, Response } from 'express';
import { getSecret } from '#airo/secrets';
import { readFileSync } from 'fs';
import { join } from 'path';

const REPO_OWNER = 'ReflectivEI';
const REPO_NAME = 'dev_projects_full-build2';
const BRANCH = 'main';

interface FileUpdate {
  path: string;
  content: string;
  sha?: string;
}

async function getFileSHA(filepath: string, token: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filepath}?ref=${BRANCH}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'ReflectivAI-Deploy'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.sha;
    }
    return null;
  } catch (error) {
    console.error(`Error getting SHA for ${filepath}:`, error);
    return null;
  }
}

async function pushFile(filepath: string, token: string): Promise<{ success: boolean; error?: string; commit?: string }> {
  try {
    // Read file content from the app directory
    const fullPath = join(process.cwd(), filepath);
    const content = readFileSync(fullPath, 'utf8');
    const base64Content = Buffer.from(content).toString('base64');
    
    // Get current file SHA (needed for updates)
    const sha = await getFileSHA(filepath, token);
    
    // Prepare request body
    const body: any = {
      message: `Product feedback: Dashboard UI improvements and PDF export`,
      content: base64Content,
      branch: BRANCH
    };
    
    if (sha) {
      body.sha = sha;
    }
    
    // Push to GitHub
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filepath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'ReflectivAI-Deploy'
        },
        body: JSON.stringify(body)
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `GitHub API error: ${response.status} - ${error}` };
    }
    
    const result = await response.json();
    return { success: true, commit: result.commit.sha };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export default async function handler(req: Request, res: Response) {
  try {
    // Get GitHub token from secrets
    const GITHUB_TOKEN = getSecret('GITHUB_TOKEN');
    
    if (!GITHUB_TOKEN) {
      return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });
    }

    // Files to push
    const filesToPush = [
      'src/pages/dashboard.tsx',
      'src/components/roleplay-feedback-dialog.tsx'
    ];

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const file of filesToPush) {
      const result = await pushFile(file, GITHUB_TOKEN);
      results.push({ file, ...result });
      
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
      
      // Rate limiting: wait 1 second between requests
      if (filesToPush.indexOf(file) < filesToPush.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    res.json({
      success: successCount === filesToPush.length,
      successCount,
      failCount,
      total: filesToPush.length,
      results,
      deploymentUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}/actions`,
      liveUrl: 'https://reflectivai-app-prod.pages.dev'
    });
  } catch (error: any) {
    console.error('Deployment error:', error);
    res.status(500).json({ error: 'Deployment failed', message: error.message });
  }
}
