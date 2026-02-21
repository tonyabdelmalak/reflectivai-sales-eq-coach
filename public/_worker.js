// Cloudflare Pages _worker.js - SPA fallback only
// API routes are handled by /functions directory
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Try to fetch the asset first
    const response = await env.ASSETS.fetch(request);
    
    // If asset exists (not 404), return it
    if (response.status !== 404) {
      return response;
    }
    
    // If 404 and it's not a file extension, serve index.html (SPA routing)
    if (!url.pathname.match(/\.[a-z]+$/i)) {
      const indexRequest = new Request(new URL('/', request.url), request);
      return env.ASSETS.fetch(indexRequest);
    }
    
    // Otherwise return the 404
    return response;
  },
};
