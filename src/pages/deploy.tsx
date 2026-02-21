import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function DeployPage() {
  const [deploying, setDeploying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = async () => {
    setDeploying(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/deploy-to-github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError('Deployment failed. Check results below.');
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="border-teal-500">
        <CardHeader>
          <CardTitle className="text-2xl">🚀 Deploy to GitHub</CardTitle>
          <CardDescription>
            Push your changes to GitHub and trigger automatic deployment to Cloudflare Pages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Changes to Deploy:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><strong>Dashboard UI Improvements</strong> - Navy blue AI Insights cards with teal borders and icons</li>
              <li><strong>Role Play PDF Export</strong> - Export evaluation results to PDF</li>
            </ul>
          </div>

          <Button 
            onClick={handleDeploy} 
            disabled={deploying}
            className="w-full bg-teal-500 hover:bg-teal-600"
            size="lg"
          >
            {deploying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Pushing to GitHub...
              </>
            ) : (
              'Push Changes to GitHub'
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-3">
              <Alert className={result.success ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500'}>
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={result.success ? 'text-green-800 dark:text-green-200' : ''}>
                  {result.success 
                    ? `✅ Successfully deployed ${result.successCount}/${result.total} files!`
                    : `❌ Deployment failed (${result.failCount}/${result.total} files failed)`
                  }
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Results:</h4>
                {result.results?.map((r: any, i: number) => (
                  <div 
                    key={i}
                    className={`p-3 rounded-lg border-l-4 ${
                      r.success 
                        ? 'bg-green-50 dark:bg-green-950 border-green-500' 
                        : 'bg-red-50 dark:bg-red-950 border-red-500'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {r.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-mono text-sm">{r.file}</div>
                        {r.success && r.commit && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Commit: {r.commit.substring(0, 7)}
                          </div>
                        )}
                        {!r.success && r.error && (
                          <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {r.error}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {result.success && (
                <div className="space-y-2 pt-4 border-t">
                  <p className="font-semibold">🚀 GitHub Actions is now deploying your changes!</p>
                  <div className="space-y-1 text-sm">
                    <a 
                      href={result.deploymentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:underline block"
                    >
                      View deployment status →
                    </a>
                    <a 
                      href={result.liveUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:underline block"
                    >
                      View live site →
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground">⏱️ Deployment usually takes 2-3 minutes</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
